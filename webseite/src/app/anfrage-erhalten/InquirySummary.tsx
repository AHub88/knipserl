"use client";

import { useEffect, useState } from "react";

export interface InquirySummaryData {
  eventDate?: string; // ISO yyyy-mm-dd
  eventType?: string;
  location?: string;
  addons?: string[];
  totalPrice?: number;
  deliveryDistance?: number;
}

const SUMMARY_KEY = "knipserl.lastInquiry";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  return `${weekdays[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function saveInquirySummary(data: InquirySummaryData) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SUMMARY_KEY, JSON.stringify(data));
  } catch {
    // Quota oder disabled — stillschweigend ignorieren
  }
}

export default function InquirySummary() {
  const [data, setData] = useState<InquirySummaryData | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SUMMARY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as InquirySummaryData;
      setData(parsed);
      // Einmal anzeigen, dann aufräumen — Reload soll keine alten Daten zeigen
      sessionStorage.removeItem(SUMMARY_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  if (!data) return null;

  const rows: { label: string; value: string }[] = [];
  if (data.eventDate) rows.push({ label: "Datum", value: formatDate(data.eventDate) });
  if (data.eventType) rows.push({ label: "Anlass", value: data.eventType });
  if (data.location) rows.push({ label: "Location", value: data.location });
  if (data.addons && data.addons.length > 0) {
    rows.push({ label: "Extras", value: data.addons.join(", ") });
  }

  // Nichts abzufeuern (z.B. nach Kontaktformular) — Box komplett weglassen
  if (rows.length === 0 && data.totalPrice == null) return null;

  return (
    <div className="mt-10 mx-auto max-w-[560px] text-left">
      <div className="bg-white rounded-lg shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        <div className="bg-[#1a171b] text-white px-6 py-3">
          <h3 className="text-[16px] uppercase tracking-wide font-[family-name:var(--font-fira-condensed)] font-extrabold">
            Deine Anfrage
          </h3>
        </div>

        <div className="px-6 py-3 divide-y divide-gray-100" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
          {rows.map((row) => (
            <div key={row.label} className="py-3 flex gap-4 items-start text-[15px]">
              <span className="text-[13px] uppercase tracking-wider text-[#999] font-semibold w-[80px] shrink-0 pt-0.5 font-[family-name:var(--font-fira-condensed)]">
                {row.label}
              </span>
              <span className="text-[#1a171b] flex-1">{row.value}</span>
            </div>
          ))}
        </div>

        {data.totalPrice != null && (
          <div className="bg-[#f9f9f9] border-t border-gray-200 px-6 py-4 flex items-baseline justify-between">
            <span className="text-[13px] uppercase tracking-wider text-[#666] font-[family-name:var(--font-fira-condensed)] font-extrabold">
              Kalkulierter Gesamtpreis
            </span>
            <span className="text-[32px] md:text-[38px] font-extrabold text-[#F3A300] leading-none font-[family-name:var(--font-fira-condensed)] tabular-nums">
              {data.totalPrice.toFixed(2).replace(".", ",")}&nbsp;€
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-[#999] mt-3 text-center" style={{ fontWeight: 400, textTransform: "none" }}>
        Alle Angaben unverbindlich. Der finale Preis wird Dir per E-Mail bestätigt.
      </p>
    </div>
  );
}
