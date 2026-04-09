"use client";

import { useState, useEffect } from "react";

interface InquiryFormProps {
  preset?: "fotobox" | "gaestetelefon";
  compact?: boolean;
}

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WEEKDAYS = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];

function MiniCalendar({ selected, onSelect }: { selected: string; onSelect: (date: string) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [busyDates, setBusyDates] = useState<Set<string>>(new Set());

  // Fetch busy dates when month changes
  useEffect(() => {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
    if (!adminUrl) return;
    const month = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    fetch(`${adminUrl}/api/busy-dates?month=${month}`)
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
  // Fill remaining cells in last row
  while (cells.length % 7 !== 0) cells.push(null);

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const prevMonth = () => {
    // Don't go before current month
    const now = new Date();
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const isSelected = (day: number) => {
    if (!selected) return false;
    const [y, m, d] = selected.split("-").map(Number);
    return day === d && viewMonth === m - 1 && viewYear === y;
  };

  const isDisabled = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    // Past days and today+1 are disabled (minimum 2 days in advance)
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 2);
    if (date < minDate) return true;
    // Busy dates (3+ bookings)
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

  return (
    <div className="bg-[#F1F3F6] rounded-md overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.12)]">
      {/* Month header */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#1a171b]">
        <button type="button" onClick={prevMonth} aria-label="Vorheriger Monat" className="text-gray-400 hover:text-white text-2xl font-bold px-4 py-2">&lsaquo;</button>
        <span className="font-bold text-xl uppercase tracking-wide text-white font-[family-name:var(--font-fira-condensed)]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth} aria-label="Nächster Monat" className="text-gray-400 hover:text-white text-2xl font-bold px-4 py-2">&rsaquo;</button>
      </div>
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-3 text-center text-xs font-bold uppercase text-[#1a171b]">
            {wd}
          </div>
        ))}
      </div>
      {/* Days */}
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
              className={`py-4 text-center text-[18px] transition-colors ${borderLeft} ${borderTop} ${
                !day ? "bg-[#F1F3F6]" :
                isSelected(day) ? "bg-[#F3A300] text-white font-bold" :
                disabled ? "text-gray-400 bg-[#F1F3F6] cursor-not-allowed" :
                "text-[#1a171b] hover:bg-gray-50"
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

function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex flex-col items-center gap-1 cursor-pointer">
      <button
        type="button"
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? "bg-[#F3A300]" : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : ""}`} />
      </button>
      <span className="text-sm text-[#1a171b]">{label}</span>
    </label>
  );
}

const inputClass = "w-full px-4 py-3 bg-[rgba(0,0,0,0.07)] border-0 rounded-[5px] text-[#1a171b] text-lg placeholder:text-gray-400 focus:ring-2 focus:ring-[#F3A300] focus:outline-none font-[family-name:var(--font-fira-sans)]";

export default function InquiryForm({ preset = "fotobox", compact = false }: InquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    art: preset === "gaestetelefon" ? "Gästetelefon" : "Knipserl mit Drucker",
    datum: "",
    vorname: "",
    nachname: "",
    telefon: "",
    email: "",
    eventType: "",
    location: "",
    nachricht: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleEventType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      eventType: prev.eventType === type ? "" : type,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.datum) {
      alert("Bitte wähle ein Datum im Kalender aus.");
      return;
    }
    setStatus("loading");

    try {
      const res = await fetch("/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Fehler beim Senden");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          Anfrage erfolgreich gesendet!
        </h3>
        <p className="text-green-700">
          Wir melden uns schnellstmöglich bei Dir. Prüfe auch Deinen Spam-Ordner.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Calendar */}
        <MiniCalendar
          selected={formData.datum}
          onSelect={(date) => setFormData((prev) => ({ ...prev, datum: date }))}
        />

        {/* Right: Form fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="vorname" required placeholder="Vorname" value={formData.vorname} onChange={handleChange} className={inputClass} />
            <input type="text" name="nachname" required placeholder="Nachname" value={formData.nachname} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="tel" name="telefon" required placeholder="Telefon *" value={formData.telefon} onChange={handleChange} className={inputClass} />
            <input type="email" name="email" required placeholder="E-Mail *" value={formData.email} onChange={handleChange} className={inputClass} />
          </div>

          {/* Event type toggles */}
          <div className="flex gap-6 py-2">
            <ToggleSwitch label="Hochzeit" checked={formData.eventType === "Hochzeit"} onChange={() => toggleEventType("Hochzeit")} />
            <ToggleSwitch label="Geburtstag" checked={formData.eventType === "Geburtstag"} onChange={() => toggleEventType("Geburtstag")} />
            <ToggleSwitch label="Firmenevent" checked={formData.eventType === "Firmenevent"} onChange={() => toggleEventType("Firmenevent")} />
          </div>

          <input type="text" name="location" required placeholder="Veranstaltungsort *" value={formData.location} onChange={handleChange} className={inputClass} />

          {!compact && (
            <textarea
              name="nachricht"
              rows={3}
              placeholder="Fragen / Anmerkungen"
              value={formData.nachricht}
              onChange={handleChange}
              className={inputClass + " resize-y"}
            />
          )}

          <p className="text-xs text-gray-500">
            Detaillierte Informationen zum Umgang mit Nutzerdaten finden Sie in unserer{" "}
            <a href="/datenschutzerklaerung" className="underline hover:text-[#F3A300]">
              Datenschutzerklärung
            </a>
            .
          </p>
        </div>
      </div>

      {/* Submit button */}
      <div className="text-center mt-8">
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-12 py-5 bg-[#F3A300] text-[#1a171b] font-bold rounded-[5px] hover:bg-[#d99200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-2xl uppercase tracking-wide font-[family-name:var(--font-fira-condensed)]"
        >
          {status === "loading" ? "Wird gesendet..." : "Unverbindlich anfragen"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-red-600 text-sm text-center mt-4">
          Es gab einen Fehler. Bitte versuche es erneut oder kontaktiere uns direkt.
        </p>
      )}
    </form>
  );
}
