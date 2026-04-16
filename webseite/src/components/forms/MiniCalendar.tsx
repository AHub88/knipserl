"use client";

import { useEffect, useState } from "react";

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WEEKDAYS = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];

export default function MiniCalendar({ selected, onSelect }: { selected: string; onSelect: (date: string) => void }) {
  const [mounted, setMounted] = useState(false);
  const [today] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  useEffect(() => setMounted(true), []);
  const [busyDates, setBusyDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const month = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    fetch(`/api/busy-dates?month=${month}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.busyDates) setBusyDates(new Set(data.busyDates));
      })
      .catch(() => {});
  }, [viewMonth, viewYear]);

  const firstDay = new Date(viewYear, viewMonth, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const prevMonth = () => {
    const now = new Date();
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    const [y, m, d] = selected.split("-").map(Number);
    return day === d && viewMonth === m - 1 && viewYear === y;
  };

  const isDisabled = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 2);
    if (date < minDate) return true;
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (busyDates.has(key)) return true;
    return false;
  };

  const handleSelect = (day: number) => {
    if (isDisabled(day)) return;
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onSelect(`${viewYear}-${m}-${d}`);
  };

  if (!mounted) {
    return (
      <div className="bg-[#F1F3F6] rounded-md overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between px-4 py-4 bg-[#1a171b]">
          <span className="font-bold text-xl uppercase tracking-wide text-white font-[family-name:var(--font-fira-condensed)]">
            Kalender wird geladen...
          </span>
        </div>
        <div className="h-[320px]" />
      </div>
    );
  }

  return (
    <div className="bg-[#F1F3F6] rounded-md overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between px-4 py-4 bg-[#1a171b]">
        <button type="button" onClick={prevMonth} aria-label="Vorheriger Monat" className="text-gray-400 hover:text-white text-2xl font-bold px-4 py-2">&lsaquo;</button>
        <span className="font-bold text-xl uppercase tracking-wide text-white font-[family-name:var(--font-fira-condensed)]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth} aria-label="Nächster Monat" className="text-gray-400 hover:text-white text-2xl font-bold px-4 py-2">&rsaquo;</button>
      </div>
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-3 text-center text-xs font-bold uppercase text-[#1a171b]">
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 bg-white">
        {cells.map((day, i) => {
          const disabled = day ? isDisabled(day) : true;
          const colIndex = i % 7;
          const borderLeft = colIndex > 0 ? "border-l border-gray-100" : "";
          const rowStart = Math.floor(i / 7);
          const borderTop = rowStart > 0 ? "border-t border-gray-100" : "";
          return (
            <button
              key={i}
              type="button"
              disabled={!day || disabled}
              onClick={() => day && handleSelect(day)}
              aria-label={day ? `${day}. ${MONTHS[viewMonth]} ${viewYear}${disabled ? " (nicht verfügbar)" : ""}` : undefined}
              className={`py-4 text-center text-[18px] transition-colors ${borderLeft} ${borderTop} ${
                !day ? "bg-[#F1F3F6]" :
                isSelected(day) ? "bg-[#F3A300] text-white font-bold cursor-pointer" :
                disabled ? "text-gray-400 bg-[#F1F3F6] cursor-not-allowed" :
                "text-[#1a171b] hover:bg-gray-50 cursor-pointer"
              }`}
            >
              {day || ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
