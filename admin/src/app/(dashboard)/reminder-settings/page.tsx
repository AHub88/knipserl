import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { IconMail } from "@tabler/icons-react";
import { ReminderSettings } from "@/components/driver/reminder-settings";

export const dynamic = "force-dynamic";

export default async function ReminderSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const driver = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, reminderEmailEnabled: true, reminderLeadDays: true },
  });

  if (!driver) redirect("/");

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0">
          <IconMail className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Auftrags-Erinnerungen
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            E-Mail-Reminder vor anstehenden Aufträgen konfigurieren
          </p>
        </div>
      </div>

      <ReminderSettings
        initialEnabled={driver.reminderEmailEnabled}
        initialLeadDays={driver.reminderLeadDays}
        driverEmail={driver.email}
      />
    </div>
  );
}
