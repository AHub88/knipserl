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
  IconEye,
  IconEyeOff,
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
  type: "ABSENT" | "LIMITED";
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
const WEEKDAYS_SHORT = ["M", "D", "M", "D", "F", "S", "S"];
const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

type ViewMode = "month" | "list";

const HIDDEN_DRIVERS_STORAGE_KEY = "calendar-hidden-drivers";
const NO_DRIVER_KEY = "__none__";

export function CalendarView() {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date());
  const [data, setData] = useState<CalendarData | null>(null);
  const [view, setView] = useState<ViewMode>("month");
  const [hiddenDriverIds, setHiddenDriverIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(HIDDEN_DRIVERS_STORAGE_KEY);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? new Set(parsed.filter((x): x is string => typeof x === "string")) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        HIDDEN_DRIVERS_STORAGE_KEY,
        JSON.stringify([...hiddenDriverIds]),
      );
    } catch {
      // localStorage may be unavailable (private mode, quota); ignore
    }
  }, [hiddenDriverIds]);

  function toggleDriverVisibility(id: string) {
    setHiddenDriverIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
    return data.orders.filter((o) => {
      if (new Date(o.eventDate).getDate() !== day) return false;
      const driverKey = o.driver?.id ?? NO_DRIVER_KEY;
      return !hiddenDriverIds.has(driverKey);
    });
  }

  // Sort vacations once, consistently by startDate then id; hidden drivers are filtered out
  const sortedVacations = data
    ? [...data.vacations]
        .filter((v) => !hiddenDriverIds.has(v.driver.id))
        .sort((a, b) => {
          const diff = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          return diff !== 0 ? diff : a.id.localeCompare(b.id);
        })
    : [];

  function getVacationsForDay(day: number): Vacation[] {
    if (!data) return [];
    const dayDate = new Date(year, month - 1, day);
    dayDate.setHours(12, 0, 0, 0); // noon to avoid timezone edge cases
    return sortedVacations.filter((v) => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return dayDate >= start && dayDate <= end;
    });
  }

  // Unique drivers present in the current month's orders or vacations (for colour legend / toggles)
  const driversInMonth = data
    ? (() => {
        const map = new Map<string, { id: string; name: string; initials?: string }>();
        for (const o of data.orders) {
          if (o.driver) {
            map.set(o.driver.id, {
              id: o.driver.id,
              name: o.driver.name,
              initials: o.driver.initials,
            });
          }
        }
        for (const v of data.vacations) {
          if (!map.has(v.driver.id)) {
            map.set(v.driver.id, { id: v.driver.id, name: v.driver.name });
          }
        }
        return Array.from(map.values()).sort((a, b) =>
          a.name.localeCompare(b.name, "de"),
        );
      })()
    : [];

  const hasOrdersWithoutDriver = data?.orders.some((o) => !o.driver) ?? false;
  const hiddenCount = [
    ...driversInMonth.map((d) => d.id),
    ...(hasOrdersWithoutDriver ? [NO_DRIVER_KEY] : []),
  ].filter((id) => hiddenDriverIds.has(id)).length;

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

  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* ── Compact Navigation Bar ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Top row: Month navigation + view toggle */}
        <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
          {/* Nav arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="flex items-center justify-center size-8 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <IconChevronLeft className="size-4" />
            </button>
            <button
              onClick={nextMonth}
              className="flex items-center justify-center size-8 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <IconChevronRight className="size-4" />
            </button>
          </div>

          {/* Month + Year */}
          <h2 className="text-base sm:text-lg font-semibold text-foreground whitespace-nowrap">
            <span className="sm:hidden">{MONTH_NAMES[month - 1].slice(0, 3)}</span>
            <span className="hidden sm:inline">{MONTH_NAMES[month - 1]}</span>
            {" "}{year}
          </h2>

          {!isCurrentMonth && (
            <button
              onClick={goToday}
              className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md hover:bg-primary/15 transition-colors"
            >
              Heute
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Filter toggle (mobile + desktop) */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={
              "flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-medium transition-colors " +
              (filtersOpen || hiddenCount > 0
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-muted text-muted-foreground hover:text-foreground")
            }
          >
            <IconTruck className="size-3.5" />
            <span className="hidden sm:inline">Fahrer</span>
            {hiddenCount > 0 && (
              <span className="size-4 flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {hiddenCount}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5">
            <button
              onClick={() => setView("month")}
              className={
                "flex items-center gap-1 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors " +
                (view === "month"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <IconCalendarMonth className="size-3.5" />
              <span className="hidden sm:inline">Monat</span>
            </button>
            <button
              onClick={() => setView("list")}
              className={
                "flex items-center gap-1 h-7 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors " +
                (view === "list"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <IconList className="size-3.5" />
              <span className="hidden sm:inline">Liste</span>
            </button>
          </div>
        </div>

        {/* Status legend — compact inline row */}
        <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-1.5 border-t border-border bg-muted/50 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
            <div className="size-2 rounded-full bg-amber-400" /> Offen
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
            <div className="size-2 rounded-full bg-blue-400" /> Zugewiesen
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
            <div className="size-2 rounded-full bg-emerald-400" /> Abgeschlossen
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
            <div className="size-2.5 w-3.5 rounded-sm bg-orange-500/20 border border-orange-500/30" /> Abwesend
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
            <div className="size-2.5 w-3.5 rounded-sm bg-yellow-500/20 border border-yellow-500/30" /> Bedingt
          </div>
        </div>

        {/* Driver filter panel — collapsible */}
        {filtersOpen && (driversInMonth.length > 0 || hasOrdersWithoutDriver) && (
          <div className="border-t border-border px-3 sm:px-4 py-2.5 bg-card">
            <div className="flex flex-wrap items-center gap-1.5">
              {driversInMonth.map((d) => {
                const dc = getDriverColor(d.id);
                const initials = getDriverInitials(d) ?? "";
                const isHidden = hiddenDriverIds.has(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDriverVisibility(d.id)}
                    aria-pressed={!isHidden}
                    title={isHidden ? `${d.name} einblenden` : `${d.name} ausblenden`}
                    className={
                      "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-opacity hover:opacity-100 " +
                      (isHidden ? "opacity-35" : "")
                    }
                    style={{
                      backgroundColor: dc.bg,
                      border: `1px solid ${dc.border}`,
                      color: dc.text,
                    }}
                  >
                    {isHidden ? (
                      <IconEyeOff className="size-3 shrink-0" />
                    ) : (
                      <span className="font-bold">{initials}</span>
                    )}
                    <span
                      className={
                        "text-foreground/80 " + (isHidden ? "line-through" : "")
                      }
                    >
                      <span className="sm:hidden">{d.name.split(" ")[0]}</span>
                      <span className="hidden sm:inline">{d.name}</span>
                    </span>
                  </button>
                );
              })}
              {hasOrdersWithoutDriver && (() => {
                const isHidden = hiddenDriverIds.has(NO_DRIVER_KEY);
                return (
                  <button
                    type="button"
                    onClick={() => toggleDriverVisibility(NO_DRIVER_KEY)}
                    aria-pressed={!isHidden}
                    title={isHidden ? "Aufträge ohne Fahrer einblenden" : "Aufträge ohne Fahrer ausblenden"}
                    className={
                      "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium border border-border bg-muted text-muted-foreground transition-opacity hover:opacity-100 " +
                      (isHidden ? "opacity-35" : "")
                    }
                  >
                    {isHidden ? (
                      <IconEyeOff className="size-3 shrink-0" />
                    ) : (
                      <IconEye className="size-3 shrink-0" />
                    )}
                    <span className={isHidden ? "line-through" : ""}>
                      Kein Fahrer
                    </span>
                  </button>
                );
              })()}
              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setHiddenDriverIds(new Set())}
                  className="text-[11px] font-medium text-primary hover:underline ml-1"
                >
                  Alle zeigen
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Month View */}
      {view === "month" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className="px-1 sm:px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
                <span className="hidden sm:inline">{d}</span>
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: offset }).map((_, i) => (
              <div
                key={`e-${i}`}
                className="min-h-[72px] sm:min-h-[100px] border-b border-r border-border bg-muted"
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
                    "min-h-[72px] sm:min-h-[100px] border-b border-r border-border p-1 sm:p-1.5 transition-colors " +
                    (isWeekend ? "bg-muted " : "") +
                    (isToday ? "bg-primary/5 " : "")
                  }
                >
                  <div
                    className={
                      "text-xs font-medium mb-1 " +
                      (isToday
                        ? "text-primary font-bold"
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
                      const isLimited = v.type === "LIMITED";
                      const typePrefix = isLimited ? "\u26A0 " : "";
                      const label = `${typePrefix}${v.driver.name}${v.note ? ` – ${v.note}` : ""}`;
                      const title = `${v.driver.name}${isLimited ? " (bedingt)" : " (abwesend)"}${v.note ? ` – ${v.note}` : ""}`;
                      const isLeftEdge = isSingle || isStart || isMonday || isFirstOfMonth;
                      const isRightEdge = isSingle || isEnd || isSunday || isLastOfMonth;

                      return (
                        <div
                          key={v.id}
                          style={{
                            backgroundColor: isLimited ? "rgba(234,179,8,0.12)" : "rgba(249,115,22,0.12)",
                            borderColor: isLimited ? "rgba(234,179,8,0.25)" : "rgba(249,115,22,0.25)",
                            color: isLimited ? "#facc15" : "#fb923c",
                          }}
                          className={
                            "border-y px-1 py-0.5 text-[10px] leading-tight truncate -mx-1.5 " +
                            (isLeftEdge ? "rounded-l ml-0 border-l " : "") +
                            (isRightEdge ? "rounded-r mr-0 border-r " : "")
                          }
                          title={title}
                        >
                          {label}
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
                          <span className="truncate text-foreground/80 group-hover:text-foreground">
                            {o.customerName}
                          </span>
                        </button>
                      );
                    })}
                    {orders.length > 3 && (
                      <div className="text-[10px] text-muted-foreground px-1">
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
            <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 text-muted-foreground">
              <IconCalendarMonth className="size-10 mb-3 text-muted-foreground" />
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
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-card")
                  }
                >
                  {/* Day header */}
                  <div className="px-4 py-2 border-b border-border flex items-center gap-3">
                    <span
                      className={
                        "text-lg font-bold tabular-nums " +
                        (isToday ? "text-primary" : "text-foreground/80")
                      }
                    >
                      {day}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase font-medium">
                      {weekday}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {MONTH_NAMES[month - 1]}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded-md">
                        Heute
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {orders.length} {orders.length === 1 ? "Auftrag" : "Aufträge"}
                    </span>
                  </div>

                  {/* Orders */}
                  <div className="divide-y divide-border">
                    {orders.map((o) => {
                      const dc = o.driver ? getDriverColor(o.driver.id) : null;
                      const initials = getDriverInitials(o.driver);
                      return (
                        <button
                          key={o.id}
                          onClick={() => router.push(`/orders/${o.id}`)}
                          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted transition-colors text-left"
                        >
                          <div
                            className={
                              "size-2.5 rounded-full shrink-0 " +
                              (STATUS_DOT[o.status] ?? "bg-[#3a3b40]")
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground truncate">
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
                    {vacations.map((v) => {
                      const isLimited = v.type === "LIMITED";
                      return (
                      <div
                        key={v.id}
                        className={"flex items-center gap-4 px-4 py-3 " + (isLimited ? "bg-yellow-500/5" : "bg-orange-500/5")}
                      >
                        <div className={"size-2.5 rounded-full shrink-0 " + (isLimited ? "bg-yellow-400" : "bg-orange-400")} />
                        <div className="flex-1">
                          <span className={"text-sm " + (isLimited ? "text-yellow-400" : "text-orange-400")}>
                            {isLimited ? "Bedingt: " : "Abwesend: "}{v.driver.name}
                          </span>
                          {v.note && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({v.note})
                            </span>
                          )}
                        </div>
                      </div>
                      );
                    })}
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
