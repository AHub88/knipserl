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
import { BOX_PRICE, EXTRAS_PRICES, calculateExtrasTotal } from "@/lib/extras-pricing";

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

  // Extras - Drucker standardmäßig ausgewählt
  const [extras, setExtras] = useState<string[]>(["Drucker"]);

  // Kalkulation
  const [boxPrice, setBoxPrice] = useState(String(BOX_PRICE));
  const [travelCost, setTravelCost] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("AMOUNT");

  // Notes
  const [comments, setComments] = useState("");

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);

  const isPrivateLocation = locationName.toLowerCase() === "privat";
  const isNewLocation = locationName.length > 1 && !selectedLocationId && !isPrivateLocation;

  function handleLocationSelect(loc: LocationOption) {
    setLocationName(loc.name);
    setSelectedLocationId(loc.id);
    const addr = [loc.street, [loc.zip, loc.city].filter(Boolean).join(" ")]
      .filter(Boolean).join(", ");
    setLocationAddress(addr);
    setDistanceKm(loc.distanceKm != null ? String(loc.distanceKm) : "");
    // Auto-fetch travel cost
    if (loc.distanceKm != null && loc.distanceKm > 0) {
      fetch(`/api/travel-pricing/calculate?distanceKm=${loc.distanceKm}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data?.customerPrice) setTravelCost(String(data.customerPrice)); })
        .catch(() => {});
    }
  }

  async function handleSaveLocation() {
    if (!locationName) return;
    setSavingLocation(true);
    try {
      const parts = locationAddress.split(",").map((s) => s.trim());
      const street = parts[0] || null;
      const cityPart = parts[1] || "";
      const zipMatch = cityPart.match(/^(\d{5})\s*(.*)/);
      const zip = zipMatch?.[1] || null;
      const city = zipMatch?.[2] || cityPart || null;

      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: locationName,
          street,
          zip,
          city,
          distanceKm: distanceKm ? Number(distanceKm) : null,
        }),
      });
      if (res.ok) {
        const loc = await res.json();
        setSelectedLocationId(loc.id);
        toast.success("Location gespeichert");
      } else {
        toast.error("Fehler beim Speichern der Location");
      }
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSavingLocation(false);
    }
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
    "h-9 w-full rounded-lg border border-white/[0.08] bg-[#1c1d20] px-3 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors [&::-webkit-calendar-picker-indicator]:invert";
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
            onChange={(v) => { setLocationName(v); setSelectedLocationId(null); }}
            onSelect={handleLocationSelect}
            locations={locations}
            inputClass={inputClass}
          />
          {isNewLocation && (
            <button
              type="button"
              onClick={handleSaveLocation}
              disabled={savingLocation}
              className="mt-1.5 text-xs text-[#F6A11C] hover:text-[#F6A11C]/80 transition-colors disabled:opacity-50"
            >
              {savingLocation ? "Speichern..." : "+ Als neue Location speichern"}
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Adresse</label>
            <input className={inputClass} value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} disabled={!!selectedLocationId && !isPrivateLocation} />
          </div>
          <div>
            <label className={labelClass}>Entfernung</label>
            <div className="relative">
              <input className={inputClass + " pr-10"} type="number" step="0.1" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} disabled={!!selectedLocationId && !isPrivateLocation} placeholder="–" />
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
        <div className="flex flex-wrap gap-2">
          {EXTRAS_CONFIG.map((ext) => {
            const active = extras.includes(ext.key);
            const price = EXTRAS_PRICES[ext.key];
            return (
              <button
                key={ext.key}
                type="button"
                onClick={() => toggleExtra(ext.key)}
                className={
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "border-[#F6A11C]/40 bg-[#F6A11C]/10 text-[#F6A11C]"
                    : "border-white/[0.08] bg-[#1c1d20] text-zinc-500 hover:text-zinc-300")
                }
              >
                <ext.icon className="size-4" />
                {ext.label}
                {price != null && price > 0 && (
                  <span className="text-xs opacity-70 tabular-nums">{price}&thinsp;&euro;</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kalkulation */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kalkulation</h2>
        <div className="grid gap-3 grid-cols-3">
          <div>
            <label className={labelClass}>Fotobox</label>
            <div className="relative">
              <input className={inputClass + " pr-10"} type="number" step="0.01" value={boxPrice} onChange={(e) => setBoxPrice(e.target.value)} />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-500">EUR</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Fahrt</label>
            <div className="relative">
              <input className={inputClass + " pr-10"} type="number" step="0.01" value={travelCost} onChange={(e) => setTravelCost(e.target.value)} placeholder="–" />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-500">EUR</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Extras</label>
            <div className="relative">
              <div className={inputClass + " flex items-center bg-transparent text-zinc-400 cursor-default pr-10"}>
                {calculateExtrasTotal(extras).toFixed(2)}
              </div>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-500">EUR</span>
            </div>
          </div>
        </div>
        <div className="grid gap-3 grid-cols-3">
          <div className="col-span-2">
            <label className={labelClass}>Rabatt</label>
            <div className="relative">
              <input className={inputClass + " pr-10"} type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-500">EUR</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Typ</label>
            <select className={selectClass} value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
              <option value="AMOUNT" className="bg-card">&euro;</option>
              <option value="PERCENT" className="bg-card">%</option>
            </select>
          </div>
        </div>
        {(() => {
          const calcBox = Number(boxPrice) || 0;
          const calcTravel = Number(travelCost) || 0;
          const calcExtras = calculateExtrasTotal(extras);
          const calcSubtotal = calcBox + calcTravel + calcExtras;
          const calcDisc = Number(discount) || 0;
          const calcDiscAmt = discountType === "PERCENT" ? (calcSubtotal * calcDisc) / 100 : calcDisc;
          const calcTotal = Math.round((calcSubtotal - calcDiscAmt) * 100) / 100;
          return (
            <div className="rounded-lg bg-[#1c1d20] border border-white/[0.06] p-3 space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Fotobox</span>
                <span className="tabular-nums">{calcBox.toFixed(2)} &euro;</span>
              </div>
              {calcTravel > 0 && (
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Fahrt{distanceKm ? ` (${distanceKm} km)` : ""}</span>
                  <span className="tabular-nums">{calcTravel.toFixed(2)} &euro;</span>
                </div>
              )}
              {extras.map((key) => {
                const cfg = EXTRAS_CONFIG.find((e) => e.key === key);
                const price = EXTRAS_PRICES[key] ?? 0;
                return price > 0 ? (
                  <div key={key} className="flex justify-between text-xs text-zinc-400">
                    <span>{cfg?.label ?? key}</span>
                    <span className="tabular-nums">{price.toFixed(2)} &euro;</span>
                  </div>
                ) : null;
              })}
              {calcDiscAmt > 0 && (
                <div className="flex justify-between text-xs text-red-400">
                  <span>Rabatt{discountType === "PERCENT" ? ` (${calcDisc}%)` : ""}</span>
                  <span className="tabular-nums">-{calcDiscAmt.toFixed(2)} &euro;</span>
                </div>
              )}
              <div className="border-t border-white/[0.10] pt-1.5 flex justify-between items-center">
                <span className="text-sm font-semibold text-zinc-200">Gesamtpreis</span>
                <span className="text-lg font-bold text-[#F6A11C] tabular-nums">{calcTotal.toFixed(2)} &euro;</span>
              </div>
            </div>
          );
        })()}
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
