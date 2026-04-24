/**
 * Fahrer-Reminder: Sendet pro aktivem Fahrer genau eine Erinnerungs-Mail pro
 * Auftrag, sobald `eventDate - reminderLeadDays` erreicht ist. Idempotent über
 * `driverReminderSentAt` / `secondDriverReminderSentAt` am Order.
 *
 * Kann per Cron (HTTP-Trigger) oder Admin-Button aufgerufen werden.
 */

import { prisma } from "@/lib/db";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { driverReminderEmail } from "@/lib/email-templates";

export type ReminderRunResult = {
  checked: number;
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
};

type DriverSlot = "primary" | "secondary";

export async function runDriverReminders(now: Date = new Date()): Promise<ReminderRunResult> {
  const result: ReminderRunResult = {
    checked: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  if (!(await isEmailConfigured())) {
    result.errors.push("E-Mail nicht konfiguriert");
    return result;
  }

  // Horizon: 14 Tage in die Zukunft reicht — größter sinnvoller Vorlauf
  // plus Puffer. Aufträge darüber hinaus erwischt der nächste Run.
  const horizon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      eventDate: { gte: now, lte: horizon },
      OR: [
        { driverId: { not: null }, driverReminderSentAt: null },
        { secondDriverId: { not: null }, secondDriverReminderSentAt: null },
      ],
    },
    include: {
      driver: true,
      secondDriver: true,
      company: { select: { name: true } },
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.ADMIN_URL || "";

  for (const order of orders) {
    for (const slot of ["primary", "secondary"] as DriverSlot[]) {
      const driver = slot === "primary" ? order.driver : order.secondDriver;
      const alreadySent =
        slot === "primary"
          ? order.driverReminderSentAt
          : order.secondDriverReminderSentAt;

      if (!driver || alreadySent) continue;
      result.checked++;

      if (!driver.active || !driver.reminderEmailEnabled) {
        result.skipped++;
        continue;
      }

      const leadMs = driver.reminderLeadDays * 24 * 60 * 60 * 1000;
      const sendThreshold = new Date(order.eventDate.getTime() - leadMs);
      if (now < sendThreshold) {
        result.skipped++;
        continue;
      }

      const { subject, html } = driverReminderEmail({
        driverName: driver.name,
        leadDays: driver.reminderLeadDays,
        companyName: order.company.name,
        customerName: order.customerName,
        eventType: order.eventType,
        eventDate: order.eventDate,
        locationName: order.locationName,
        locationAddress: order.locationAddress,
        setupDate: order.setupDate,
        setupTime: order.setupTime,
        teardownDate: order.teardownDate,
        teardownTime: order.teardownTime,
        onSiteContactName: order.onSiteContactName,
        onSiteContactPhone: order.onSiteContactPhone,
        onSiteContactNotes: order.onSiteContactNotes,
        notes: order.notes,
        orderDetailUrl: baseUrl ? `${baseUrl}/driver/orders/${order.id}` : null,
      });

      try {
        await sendEmail({ to: driver.email, subject, html });
        const sentField =
          slot === "primary" ? "driverReminderSentAt" : "secondDriverReminderSentAt";
        await prisma.order.update({
          where: { id: order.id },
          data: { [sentField]: new Date() },
        });
        result.sent++;
      } catch (err) {
        result.failed++;
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`order ${order.id} / ${driver.email}: ${msg}`);
        console.error("[driver-reminders] send failed", { orderId: order.id, driver: driver.email, err });
      }
    }
  }

  return result;
}
