"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendarMonth,
  IconList,
  IconAlertTriangle,
  IconCircleCheck,
  IconPalette,
  IconTruck,
  IconCoin,
} from "@tabler/icons-react";

interface Order {
  id: string;
  customerName: string;
  eventType: string;
  eventDate: string;
  locationName: string;
  status: string;
  driver: { id: string; name: string; initials?: string } | null;
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

const STATUS_DOT: Record<string, string> = {
  OPEN: "bg-amber-400",
  ASSIGNED: "bg-blue-400",
  COMPLETED: "bg-emerald-400",
  CANCELLED: "bg-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Offen",
  ASSIGNED: "Zugewiesen",
  COMPLETED: "Abgeschlossen",
  CANCELLED: "Storniert",
};

const DRIVER_COLORS = [
  { bg: "rgba(139,92,246,0.2)", text: "#c4b5fd", border: "rgba(139,92,246,0.3)" },
  { bg: "rgba(6,182,212,0.2)", text: "#67e8f9", border: "rgba(6,182,212,0.3)" },
  { bg: "rgba(236,72,153,0.2)", text: "#f9a8d4", border: "rgba(236,72,153,0.3)" },
  { bg: "rgba(132,204,22,0.2)", text: "#bef264", border: "rgba(132,204,22,0.3)" },
  { bg: "rgba(14,165,233,0.2)", text: "#7dd3fc", border: "rgba(14,165,233,0.3)" },
  { bg: "rgba(244,63,94,0.2)", text: "#fda4af", border: "rgba(244,63,94,0.3)" },
  { bg: "rgba(20,184,166,0.2)", text: "#5eead4", border: "rgba(20,184,166,0.3)" },
  { bg: "rgba(217,70,239,0.2)", text: "#f0abfc", border: "rgba(217,70,239,0.3)" },
];

function getDriverColor(driverId: string) {
  let hash = 0;
  for (let i = 0; i < driverId.length; i++) {
    hash = ((hash << 5) - hash + driverId.charCodeAt(i)) | 0;
  }
  return DRIVER_COLORS[Math.abs(hash) % DRIVER_COLORS.length];
}

function getDriverInitials(driver: { name: string; initials?: string } | null) {
  if (!driver) return null;
  if (driver.initials) return driver.initials;
  const parts = driver.name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return driver.name.substring(0, 2).toUpperCase();
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

type ViewMode = "month" | "list";

export function CalendarView() {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date());
  const [data, setData] = useState<CalendarData | null>(null);
  const [view, setView] = useState<ViewMode>("month");

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
  function goToday() {
    setDate(new Date());
  }

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;

  // Calendar grid
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  function getOrdersForDay(day: number): Order[] {
    if (!data) return [];
    return data.orders.filter((o) => new Date(o.eventDate).getDate() === day);
  }

  function getVacationsForDay(day: number): Vacation[] {
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

  // Group orders by day for list view
  function getOrdersByDay(): { day: number; weekday: string; orders: Order[]; vacations: Vacation[] }[] {
    const days: { day: number; weekday: string; orders: Order[]; vacations: Vacation[] }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const orders = getOrdersForDay(d);
      const vacations = getVacationsForDay(d);
      if (orders.length > 0 || vacations.length > 0) {
        const dateObj = new Date(year, month - 1, d);
        const weekday = dateObj.toLocaleDateString("de-DE", { weekday: "short" });
        days.push({ day: d, weekday, orders, vacations });
      }
    }
    return days;
  }

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="flex items-center justify-center size-9 rounded-lg border border-white/[0.08] bg-[#1c1d20] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <IconChevronLeft className="size-4" />
          </button>
          <button
            onClick={nextMonth}
            className="flex items-center justify-center size-9 rounded-lg border border-white/[0.08] bg-[#1c1d20] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <IconChevronRight className="size-4" />
          </button>
          <h2 className="text-lg font-semibold text-zinc-100 ml-2">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          {!isCurrentMonth && (
            <button
              onClick={goToday}
              className="ml-2 text-xs text-[#F6A11C] hover:underline"
            >
              Heute
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-card p-0.5">
          <button
            onClick={() => setView("month")}
            className={
              "flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-colors " +
              (view === "month"
                ? "bg-[#F6A11C]/15 text-[#F6A11C]"
                : "text-muted-foreground hover:text-zinc-300")
            }
          >
            <IconCalendarMonth className="size-3.5" />
            Monat
          </button>
          <button
            onClick={() => setView("list")}
            className={
              "flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-colors " +
              (view === "list"
                ? "bg-[#F6A11C]/15 text-[#F6A11C]"
                : "text-muted-foreground hover:text-zinc-300")
            }
          >
            <IconList className="size-3.5" />
            Liste
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-amber-400" /> Offen
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-blue-400" /> Zugewiesen
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-emerald-400" /> Abgeschlossen
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 w-4 rounded bg-orange-500/20 border border-orange-500/30" /> Urlaub
        </div>
      </div>

      {/* Month View */}
      {view === "month" && (
        <div className="rounded-xl border border-white/[0.10] bg-card overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.10]">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: offset }).map((_, i) => (
              <div
                key={`e-${i}`}
                className="min-h-[100px] border-b border-r border-white/[0.10] bg-[#121315]"
              />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const orders = getOrdersForDay(day);
              const vacations = getVacationsForDay(day);
              const isToday =
                today.getDate() === day && isCurrentMonth;
              const isWeekend =
                new Date(year, month - 1, day).getDay() % 6 === 0;

              return (
                <div
                  key={day}
                  className={
                    "min-h-[100px] border-b border-r border-white/[0.10] p-1.5 transition-colors " +
                    (isWeekend ? "bg-[#121315] " : "") +
                    (isToday ? "bg-[#F6A11C]/5 " : "")
                  }
                >
                  <div
                    className={
                      "text-xs font-medium mb-1 " +
                      (isToday
                        ? "text-[#F6A11C] font-bold"
                        : "text-muted-foreground")
                    }
                  >
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {/* Vacations first so multi-day bars aren't interrupted */}
                    {vacations.map((v) => {
                      const vStart = new Date(v.startDate);
                      const vEnd = new Date(v.endDate);
                      vStart.setHours(0,0,0,0);
                      vEnd.setHours(0,0,0,0);
                      const currentDay = new Date(year, month - 1, day);
                      currentDay.setHours(0,0,0,0);
                      const isStart = currentDay.getTime() === vStart.getTime();
                      const isEnd = currentDay.getTime() === vEnd.getTime();
                      const isSingle = isStart && isEnd;
                      const isMonday = currentDay.getDay() === 1;
                      const isSunday = currentDay.getDay() === 0;
                      const isFirstOfMonth = day === 1;
                      const isLastOfMonth = day === daysInMonth;
                      const showLabel = isStart || isMonday || isFirstOfMonth;
                      const title = `${v.driver.name}${v.note ? ` – ${v.note}` : ""}`;

                      return (
                        <div
                          key={v.id}
                          className={
                            "bg-orange-500/15 border-y border-orange-500/20 px-1 py-0.5 text-[10px] leading-tight text-orange-400 truncate -mx-1.5 " +
                            (isSingle ? "rounded mx-0 border-x " : "") +
                            (!isSingle && (isStart || isMonday || isFirstOfMonth) ? "rounded-l ml-0 border-l " : "") +
                            (!isSingle && (isEnd || isSunday || isLastOfMonth) ? "rounded-r mr-0 border-r " : "")
                          }
                          title={title}
                        >
                          {showLabel ? title : "\u00A0"}
                        </div>
                      );
                    })}
                    {orders.slice(0, 3).map((o) => {
                      const dc = o.driver ? getDriverColor(o.driver.id) : null;
                      const initials = getDriverInitials(o.driver);
                      return (
                        <button
                          key={o.id}
                          onClick={() => router.push(`/orders/${o.id}`)}
                          className="w-full flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight transition-colors text-left group"
                          style={dc ? {
                            backgroundColor: dc.bg,
                            border: `1px solid ${dc.border}`,
                          } : {
                            backgroundColor: "rgba(255,255,255,0.04)",
                            border: "1px solid transparent",
                          }}
                          title={`${o.customerName} – ${o.eventType} @ ${o.locationName} (${o.driver?.name ?? "Kein Fahrer"})`}
                        >
                          <div
                            className={
                              "size-1.5 rounded-full shrink-0 " +
                              (STATUS_DOT[o.status] ?? "bg-[#3a3b40]")
                            }
                          />
                          {initials && (
                            <span
                              className="font-bold shrink-0"
                              style={{ color: dc?.text ?? "#a1a1aa" }}
                            >
                              {initials}
                            </span>
                          )}
                          <span className="truncate text-zinc-300 group-hover:text-zinc-100">
                            {o.customerName}
                          </span>
                        </button>
                      );
                    })}
                    {orders.length > 3 && (
                      <div className="text-[10px] text-zinc-400 px-1">
                        +{orders.length - 3} weitere
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="space-y-2">
          {!data || getOrdersByDay().length === 0 ? (
            <div className="rounded-xl border border-white/[0.10] bg-card flex flex-col items-center justify-center py-16 text-muted-foreground">
              <IconCalendarMonth className="size-10 mb-3 text-zinc-400" />
              <p className="text-sm">Keine Einträge in diesem Monat</p>
            </div>
          ) : (
            getOrdersByDay().map(({ day, weekday, orders, vacations }) => {
              const isToday = today.getDate() === day && isCurrentMonth;
              return (
                <div
                  key={day}
                  className={
                    "rounded-xl border overflow-hidden " +
                    (isToday
                      ? "border-[#F6A11C]/30 bg-[#F6A11C]/5"
                      : "border-white/[0.10] bg-card")
                  }
                >
                  {/* Day header */}
                  <div className="px-4 py-2 border-b border-white/[0.10] flex items-center gap-3">
                    <span
                      className={
                        "text-lg font-bold tabular-nums " +
                        (isToday ? "text-[#F6A11C]" : "text-zinc-300")
                      }
                    >
                      {day}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase font-medium">
                      {weekday}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {MONTH_NAMES[month - 1]}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F6A11C] bg-[#F6A11C]/15 px-2 py-0.5 rounded-md">
                        Heute
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {orders.length} {orders.length === 1 ? "Auftrag" : "Aufträge"}
                    </span>
                  </div>

                  {/* Orders */}
                  <div className="divide-y divide-white/[0.04]">
                    {orders.map((o) => {
                      const dc = o.driver ? getDriverColor(o.driver.id) : null;
                      const initials = getDriverInitials(o.driver);
                      return (
                        <button
                          key={o.id}
                          onClick={() => router.push(`/orders/${o.id}`)}
                          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#1c1d20] transition-colors text-left"
                        >
                          <div
                            className={
                              "size-2.5 rounded-full shrink-0 " +
                              (STATUS_DOT[o.status] ?? "bg-[#3a3b40]")
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-zinc-200 truncate">
                                {o.customerName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {o.eventType}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {o.locationName}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {o.driver ? (
                              <span
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md"
                                style={dc ? {
                                  backgroundColor: dc.bg,
                                  color: dc.text,
                                  border: `1px solid ${dc.border}`,
                                } : {}}
                              >
                                {initials && (
                                  <span className="font-bold">{initials}</span>
                                )}
                                {o.driver.name}
                              </span>
                            ) : (
                              <span className="text-xs text-red-400/60 italic">
                                Kein Fahrer
                              </span>
                            )}
                          </div>
                          <span
                            className={
                              "text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 " +
                              (o.status === "OPEN"
                                ? "bg-amber-500/15 text-amber-400"
                                : o.status === "ASSIGNED"
                                ? "bg-blue-500/15 text-blue-400"
                                : o.status === "COMPLETED"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-red-500/15 text-red-400")
                            }
                          >
                            {STATUS_LABEL[o.status] ?? o.status}
                          </span>
                        </button>
                      );
                    })}
                    {vacations.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-4 px-4 py-3 bg-orange-500/5"
                      >
                        <div className="size-2.5 rounded-full bg-orange-400 shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm text-orange-400">
                            Urlaub: {v.driver.name}
                          </span>
                          {v.note && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({v.note})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
