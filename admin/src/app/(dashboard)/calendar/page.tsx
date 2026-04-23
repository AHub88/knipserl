import { IconCalendar } from "@tabler/icons-react";
import { CalendarView } from "./calendar-view";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
          <IconCalendar className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Kalender
          </h1>
          <p className="text-sm text-muted-foreground">
            Auftr&auml;ge und Fahrer-Urlaube im &Uuml;berblick
          </p>
        </div>
      </div>
      <CalendarView />
    </div>
  );
}
