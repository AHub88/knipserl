import Link from "next/link";
import { prisma } from "@/lib/db";
import { ReminderSettings } from "@/components/driver/reminder-settings";
import {
  IconClipboardCheck,
  IconClipboardList,
  IconCalendar,
  IconMapPin,
  IconExternalLink,
  IconCalendarEvent,
  IconRoute,
  IconBeach,
} from "@tabler/icons-react";

function formatDateLong(date: Date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function daysUntil(date: Date, now: Date) {
  const a = new Date(date);
  a.setHours(0, 0, 0, 0);
  const b = new Date(now);
  b.setHours(0, 0, 0, 0);
  const diff = Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Heute";
  if (diff === 1) return "Morgen";
  if (diff < 7) return `in ${diff} Tagen`;
  if (diff < 14) return "in 1 Woche";
  return `in ${Math.floor(diff / 7)} Wochen`;
}

function extractCity(address: string): string {
  return address.match(/\d{5}\s+(.+)$/)?.[1]?.trim() ?? "";
}

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[driver-dashboard] ${label} query failed`, e);
    return fallback;
  }
}

export async function DriverDashboard({
  driverId,
  driverName,
}: {
  driverId: string;
  driverName: string | null;
}) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const [nextOrder, freeOrdersCount, myOrdersCount, weekOrders, activeVacation, driver] =
    await Promise.all([
      safe(
        "nextOrder",
        () =>
          prisma.order.findFirst({
            where: {
              driverId,
              status: { not: "CANCELLED" },
              eventDate: { gte: startOfToday },
            },
            orderBy: { eventDate: "asc" },
          }),
        null,
      ),
      safe(
        "freeOrdersCount",
        () =>
          prisma.order.count({
            where: {
              status: "OPEN",
              driverId: null,
              secondDriverId: null,
              eventDate: { gte: startOfToday },
            },
          }),
        0,
      ),
      safe(
        "myOrdersCount",
        () =>
          prisma.order.count({
            where: {
              driverId,
              status: { not: "CANCELLED" },
              eventDate: { gte: startOfToday },
            },
          }),
        0,
      ),
      safe(
        "weekOrders",
        () =>
          prisma.order.findMany({
            where: {
              driverId,
              status: { not: "CANCELLED" },
              eventDate: { gte: startOfToday, lt: endOfWeek },
            },
            orderBy: { eventDate: "asc" },
            take: 5,
          }),
        [] as Awaited<ReturnType<typeof prisma.order.findMany>>,
      ),
      safe(
        "activeVacation",
        () =>
          prisma.vacation.findFirst({
            where: {
              driverId,
              endDate: { gte: startOfToday },
            },
            orderBy: { startDate: "asc" },
          }),
        null,
      ),
      safe(
        "driver",
        () =>
          prisma.user.findUnique({
            where: { id: driverId },
            select: { email: true, reminderEmailEnabled: true, reminderLeadDays: true },
          }),
        null,
      ),
    ]);

  const firstName = (driverName ?? "").split(" ")[0] || "Hallo";

  const mapsUrl = nextOrder
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextOrder.locationAddress)}`
    : null;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-3xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Hallo, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {nextOrder
            ? `Deine nächste Fahrt: ${daysUntil(new Date(nextOrder.eventDate), now)}`
            : "Aktuell kein Auftrag geplant"}
        </p>
      </div>

      {/* Hero: Nächste Fahrt */}
      {nextOrder ? (
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-primary/[0.04] to-transparent overflow-hidden">
          <Link
            href={`/orders/${nextOrder.id}`}
            className="block p-5 sm:p-6 hover:bg-primary/[0.03] transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <IconCalendarEvent className="size-4 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Nächste Fahrt
              </span>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider rounded-md bg-primary/15 text-primary px-2 py-0.5">
                {daysUntil(new Date(nextOrder.eventDate), now)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDateLong(new Date(nextOrder.eventDate))}
            </p>
            <p className="text-lg sm:text-xl font-bold text-foreground mt-1 leading-snug">
              {nextOrder.locationName ||
                extractCity(nextOrder.locationAddress) ||
                nextOrder.locationAddress}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <IconMapPin className="size-3.5 shrink-0" />
              <span className="truncate">{nextOrder.locationAddress}</span>
            </div>
            <p className="text-sm text-foreground/80 mt-2">
              <span className="font-medium">{nextOrder.customerName}</span>
              <span className="text-muted-foreground"> · {nextOrder.eventType}</span>
            </p>
          </Link>
          {mapsUrl && (
            <div className="px-5 pb-5 sm:px-6 sm:pb-6 -mt-1">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <IconExternalLink className="size-4" />
                Route in Google Maps
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <IconCalendarEvent className="size-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">
            Aktuell kein Auftrag geplant
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Schau bei den freien Aufträgen vorbei.
          </p>
        </div>
      )}

      {/* Schnellaktionen */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Link
          href="/free-orders"
          className="rounded-xl border border-border bg-card hover:border-emerald-500/30 transition-colors p-3 sm:p-4 flex flex-col items-center gap-1.5"
        >
          <IconClipboardCheck className="size-5 sm:size-6 text-emerald-500" />
          <span className="text-lg sm:text-2xl font-extrabold text-foreground tabular-nums leading-none">
            {freeOrdersCount}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Frei</span>
        </Link>
        <Link
          href="/my-orders"
          className="rounded-xl border border-border bg-card hover:border-primary/30 transition-colors p-3 sm:p-4 flex flex-col items-center gap-1.5"
        >
          <IconClipboardList className="size-5 sm:size-6 text-primary" />
          <span className="text-lg sm:text-2xl font-extrabold text-foreground tabular-nums leading-none">
            {myOrdersCount}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Meine</span>
        </Link>
        <Link
          href="/calendar"
          className="rounded-xl border border-border bg-card hover:border-primary/30 transition-colors p-3 sm:p-4 flex flex-col items-center gap-1.5"
        >
          <IconCalendar className="size-5 sm:size-6 text-primary" />
          <span className="text-lg sm:text-2xl font-extrabold text-muted-foreground/40 tabular-nums leading-none">
            ·
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Kalender</span>
        </Link>
      </div>

      {/* Diese Woche */}
      {weekOrders.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
            <IconRoute className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Diese Woche</h2>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {weekOrders.length} {weekOrders.length === 1 ? "Auftrag" : "Aufträge"}
            </span>
          </div>
          <div className="divide-y divide-border">
            {weekOrders.map((order) => {
              const eventDate = new Date(order.eventDate);
              const dayNum = eventDate.getDate();
              const weekday = eventDate
                .toLocaleDateString("de-DE", { weekday: "short" })
                .toUpperCase();
              const isFirst = order.id === nextOrder?.id;
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center w-10 shrink-0">
                    <span className="text-[9px] font-bold tracking-wide text-primary leading-none">
                      {weekday}
                    </span>
                    <span className="text-lg font-extrabold text-foreground leading-none mt-0.5">
                      {dayNum}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {order.locationName ||
                        extractCity(order.locationAddress) ||
                        order.locationAddress}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.customerName} · {order.eventType}
                    </p>
                  </div>
                  {isFirst && (
                    <span className="text-[9px] font-bold uppercase tracking-wider rounded bg-primary/15 text-primary px-1.5 py-0.5 shrink-0">
                      Nächste
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Aktiver / nächster Urlaub */}
      {activeVacation && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 flex items-start gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-amber-500/15 shrink-0">
            <IconBeach className="size-4 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {activeVacation.type === "ABSENT" ? "Abwesenheit" : "Eingeschränkt"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(activeVacation.startDate).toLocaleDateString("de-DE")} –{" "}
              {new Date(activeVacation.endDate).toLocaleDateString("de-DE")}
              {activeVacation.note && ` · ${activeVacation.note}`}
            </p>
          </div>
          <Link
            href="/my-vacation"
            className="text-[11px] font-semibold text-amber-500 hover:text-amber-400 transition-colors shrink-0"
          >
            Bearbeiten →
          </Link>
        </div>
      )}

      {/* Reminder-Einstellungen */}
      {driver && (
        <ReminderSettings
          initialEnabled={driver.reminderEmailEnabled}
          initialLeadDays={driver.reminderLeadDays}
          driverEmail={driver.email}
        />
      )}
    </div>
  );
}
