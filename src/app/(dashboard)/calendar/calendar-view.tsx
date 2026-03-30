"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconChevronLeft, IconChevronRight, IconAlertTriangle } from "@tabler/icons-react";

interface Order {
  id: string;
  customerName: string;
  eventType: string;
  eventDate: string;
  locationName: string;
  status: string;
  driver: { id: string; name: string } | null;
}

interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  note: string | null;
  driver: { id: string; name: string };
}

interface CalendarData {
  orders: Order[];
  vacations: Vacation[];
}

const statusColors: Record<string, string> = {
  OPEN: "bg-yellow-500",
  ASSIGNED: "bg-blue-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

export function CalendarView() {
  const [date, setDate] = useState(() => new Date());
  const [data, setData] = useState<CalendarData | null>(null);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/calendar?year=${year}&month=${month}`);
    if (res.ok) setData(await res.json());
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function prevMonth() {
    setDate(new Date(year, month - 2, 1));
  }

  function nextMonth() {
    setDate(new Date(year, month, 1));
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start

  const days: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function getOrdersForDay(day: number) {
    if (!data) return [];
    return data.orders.filter((o) => {
      const d = new Date(o.eventDate);
      return d.getDate() === day;
    });
  }

  function getVacationsForDay(day: number) {
    if (!data) return [];
    const dayDate = new Date(year, month - 1, day);
    return data.vacations.filter((v) => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return dayDate >= start && dayDate <= end;
    });
  }

  // Check for staffing issues
  const allDriversOnVacation =
    data?.vacations &&
    data.orders.some((o) => {
      if (o.status !== "OPEN") return false;
      const orderDay = new Date(o.eventDate).getDate();
      const vacsOnDay = getVacationsForDay(orderDay);
      return vacsOnDay.length > 0; // simplified check
    });

  const monthName = date.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <IconChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <IconChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {allDriversOnVacation && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          <IconAlertTriangle className="h-4 w-4" />
          Achtung: Es gibt offene Aufträge an Tagen mit Fahrer-Urlaub!
        </div>
      )}

      <Card>
        <CardContent className="p-2">
          <div className="grid grid-cols-7 gap-px">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
              <div
                key={d}
                className="p-2 text-center text-xs font-medium text-muted-foreground"
              >
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="min-h-[80px]" />;
              }

              const orders = getOrdersForDay(day);
              const vacations = getVacationsForDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month - 1 &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={day}
                  className={`min-h-[80px] rounded-md border p-1 ${
                    isToday ? "border-primary bg-primary/5" : "border-transparent"
                  }`}
                >
                  <div
                    className={`text-xs font-medium ${
                      isToday ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="mt-0.5 space-y-0.5">
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight bg-muted"
                        title={`${o.customerName} – ${o.eventType} (${o.driver?.name ?? "Kein Fahrer"})`}
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusColors[o.status] ?? "bg-gray-400"}`}
                        />
                        <span className="truncate">{o.customerName}</span>
                      </div>
                    ))}
                    {vacations.map((v) => (
                      <div
                        key={v.id}
                        className="rounded bg-orange-100 px-1 py-0.5 text-[10px] leading-tight text-orange-700 truncate"
                        title={`Urlaub: ${v.driver.name}${v.note ? ` (${v.note})` : ""}`}
                      >
                        🏖 {v.driver.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-yellow-500" /> Offen
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" /> Zugewiesen
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" /> Abgeschlossen
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-4 rounded bg-orange-100 border border-orange-200" /> Urlaub
        </div>
      </div>
    </div>
  );
}
