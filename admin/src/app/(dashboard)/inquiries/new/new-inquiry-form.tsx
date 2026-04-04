"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconPrinter,
  IconMask,
  IconUsb,
  IconPhoto,
  IconHeart,
  IconWorldWww,
  IconBook,
  IconDeviceTv,
  IconPhone,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { EXTRAS_PRICES } from "@/lib/extras-pricing";

const EXTRAS_CONFIG = [
  { key: "Drucker", label: "Drucker", icon: IconPrinter },
  { key: "Props", label: "Requisiten", icon: IconMask },
  { key: "Stick", label: "USB Stick", icon: IconUsb },
  { key: "HG", label: "Hintergrund", icon: IconPhoto },
  { key: "LOVE", label: "LOVE", icon: IconHeart },
  { key: "Social", label: "Online", icon: IconWorldWww },
  { key: "Book", label: "Gästebuch", icon: IconBook },
  { key: "TV", label: "TV", icon: IconDeviceTv },
  { key: "Telefon", label: "Telefon", icon: IconPhone },
] as const;

const EVENT_TYPES = [
  "Hochzeit", "Geburtstag", "Firmenevent", "Taufe", "Kommunion",
  "Konfirmation", "Jubiläum", "Messe", "Weihnachtsfeier", "Sonstiges",
];

type LocationOption = {
  id: string;
  name: string;
  street: string | null;
  zip: string | null;
  city: string | null;
  distanceKm: number | null;
};

function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  locations,
  inputClass,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (loc: LocationOption) => void;
  locations: LocationOption[];
  inputClass: string;
}) {
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => {
    if (!value || value.length < 1) return [];
    const q = value.toLowerCase();
    return locations.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 8);
  }, [value, locations]);

  return (
    <div className="relative">
      <input
        className={inputClass}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Location eingeben..."
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-white/[0.1] bg-card shadow-xl max-h-56 overflow-y-auto">
          {suggestions.map((loc) => (
            <button
              key={loc.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#222326] transition-colors border-b border-white/[0.10] last:border-0"
              onMouseDown={(e) => { e.preventDefault(); onSelect(loc); setOpen(false); }}
            >
              <span className="text-zinc-200 font-medium">{loc.name}</span>
              {loc.city && (
                <span className="text-muted-foreground ml-2">
                  {loc.street ? `${loc.street}, ` : ""}{loc.zip} {loc.city}
                  {loc.distanceKm != null && ` · ${loc.distanceKm} km`}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NewInquiryForm({ locations }: { locations: LocationOption[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Customer
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerType, setCustomerType] = useState("PRIVATE");

  // Event
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");

  // Location
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [distanceKm, setDistanceKm] = useState("");

  // Extras
  const [extras, setExtras] = useState<string[]>([]);

  // Notes
  const [comments, setComments] = useState("");

  const isPrivateLocation = locationName.toLowerCase() === "privat";

  function handleLocationSelect(loc: LocationOption) {
    setLocationName(loc.name);
    const addr = [loc.street, [loc.zip, loc.city].filter(Boolean).join(" ")]
      .filter(Boolean).join(", ");
    setLocationAddress(addr);
    setDistanceKm(loc.distanceKm != null ? String(loc.distanceKm) : "");
  }

  function toggleExtra(key: string) {
    setExtras((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );
  }

  async function handleSave() {
    if (!customerName || !eventDate || !eventType) {
      toast.error("Name, Datum und Eventart sind Pflichtfelder");
      return;
    }
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast.error("Bitte eine gültige E-Mail-Adresse eingeben oder das Feld leer lassen");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          customerType,
          eventType,
          eventDate,
          locationName,
          locationAddress,
          distanceKm: distanceKm ? Number(distanceKm) : null,
          extras,
          comments,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Erstellen");
      }
      toast.success("Anfrage erstellt");
      router.push("/inquiries");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-white/[0.08] bg-[#1c1d20] px-3 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors";
  const labelClass =
    "block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1";
  const selectClass =
    "h-9 w-full rounded-lg border border-white/[0.08] bg-[#1c1d20] px-2 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 cursor-pointer appearance-none bg-[length:12px] bg-[right_8px_center] bg-no-repeat bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]";

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/inquiries" className="flex items-center justify-center size-9 rounded-lg border border-white/[0.08] bg-[#1c1d20] text-zinc-400 hover:text-zinc-200 transition-colors">
            <IconArrowLeft className="size-4" />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-100">Neue Anfrage</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 disabled:opacity-50 transition-colors">
          <IconDeviceFloppy className="size-4" />
          {saving ? "Erstellen..." : "Anfrage erstellen"}
        </button>
      </div>

      {/* Event & Location */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event & Location</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Eventart *</label>
            <select className={selectClass} value={eventType} onChange={(e) => setEventType(e.target.value)}>
              <option value="" className="bg-card">– Auswählen –</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t} className="bg-card">{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Datum *</label>
            <input className={inputClass} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <LocationAutocomplete
            value={locationName}
            onChange={setLocationName}
            onSelect={handleLocationSelect}
            locations={locations}
            inputClass={inputClass}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Adresse</label>
            <input className={inputClass} value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} disabled={!isPrivateLocation && locationAddress !== ""} />
          </div>
          <div>
            <label className={labelClass}>Entfernung</label>
            <div className="relative">
              <input className={inputClass + " pr-10"} type="number" step="0.1" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} disabled={!isPrivateLocation && distanceKm !== ""} placeholder="–" />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-500">km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kundendaten */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kundendaten</h2>
        <div>
          <label className={labelClass}>Name *</label>
          <input className={inputClass} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Vor- und Nachname" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>E-Mail</label>
            <input className={inputClass} type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="optional" />
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input className={inputClass} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="optional" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Kundentyp</label>
          <select className={selectClass} value={customerType} onChange={(e) => setCustomerType(e.target.value)}>
            <option value="PRIVATE" className="bg-card">Privat</option>
            <option value="BUSINESS" className="bg-card">Geschäftlich</option>
          </select>
        </div>
      </div>

      {/* Extras */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Extras</h2>
        <div className="flex flex-wrap gap-1.5">
          {EXTRAS_CONFIG.map((ext) => {
            const active = extras.includes(ext.key);
            const price = EXTRAS_PRICES[ext.key];
            return (
              <button
                key={ext.key}
                type="button"
                onClick={() => toggleExtra(ext.key)}
                className={
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors " +
                  (active
                    ? "border-[#F6A11C]/40 bg-[#F6A11C]/10 text-[#F6A11C]"
                    : "border-white/[0.08] bg-[#1c1d20] text-zinc-500 hover:text-zinc-300")
                }
              >
                <ext.icon className="size-3.5" />
                {ext.label}
                {price != null && price > 0 && (
                  <span className="text-[10px] opacity-70 tabular-nums">{price}&thinsp;&euro;</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notizen */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kommentar</h2>
        <textarea className={inputClass + " h-24 py-2 resize-none"} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Anmerkungen zur Anfrage..." />
      </div>

      {/* Mobile floating save button */}
      <div className="fixed bottom-4 left-4 right-4 sm:hidden z-20">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-xl bg-[#F6A11C] text-black font-semibold text-base shadow-lg shadow-black/30 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <IconDeviceFloppy className="size-5" />
          {saving ? "Erstellen..." : "Anfrage erstellen"}
        </button>
      </div>
    </div>
  );
}
