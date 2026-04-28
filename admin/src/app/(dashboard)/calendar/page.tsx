import { IconCalendar } from "@tabler/icons-react";
import { CalendarView } from "./calendar-view";

export default function CalendarPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-9 sm:size-10 rounded-xl bg-primary/10 text-primary shrink-0">
          <IconCalendar className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Kalender
          </h1>
          <p className="hidden sm:block text-sm text-muted-foreground">
            Auftr&auml;ge und Fahrer-Urlaube im &Uuml;berblick
          </p>
        </div>
      </div>
      <CalendarView />
    </div>
  );
}
