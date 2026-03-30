import { CalendarView } from "./calendar-view";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kalender</h1>
        <p className="text-muted-foreground">
          Monatsübersicht aller Aufträge und Fahrer-Urlaube
        </p>
      </div>
      <CalendarView />
    </div>
  );
}
