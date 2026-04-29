import { IconCalendar } from "@tabler/icons-react";
import { CalendarView } from "@/app/(dashboard)/calendar/calendar-view";

export default function DriverCalendarPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0">
          <IconCalendar className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Kalender
          </h1>
          <p className="text-xs text-muted-foreground">
            Aufträge und Urlaube im Überblick
          </p>
        </div>
      </div>
      <CalendarView orderLinkBase="/driver/orders" />
    </div>
  );
}
