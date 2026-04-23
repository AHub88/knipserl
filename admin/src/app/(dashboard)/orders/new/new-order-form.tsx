"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconCircleCheck,
  IconPalette,
  IconTruck,
  IconCoin,
  IconMask,
  IconDeviceTv,
  IconHeart,
  IconBook,
  IconUsb,
  IconPhoto,
  IconWorldWww,
  IconPrinter,
  IconPhone,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { BOX_PRICE, EXTRAS_PRICES, calculateExtrasTotal } from "@/lib/extras-pricing";

type LocationOption = {
  id: string;
  name: string;
  street: string | null;
  zip: string | null;
  city: string | null;
  distanceKm: number | null;
};

type Props = {
  drivers: { id: string; name: string; initials: string | null }[];
  companies: { id: string; name: string }[];
  locations: LocationOption[];
};

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

function ExtraToggle({
  label,
  icon: Icon,
  active,
  onClick,
  price,
}: {
  label: string;
  icon: typeof IconMask;
  active: boolean;
  onClick: () => void;
  price?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 min-w-[80px] transition-colors cursor-pointer hover:opacity-80 " +
        (active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground")
      }
    >
      <Icon className="size-7" />
      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </span>
      {price != null && price > 0 && (
        <span className="text-[10px] font-mono tabular-nums opacity-70">
          {price} &euro;
        </span>
      )}
    </button>
  );
}

function StatusToggle({
  label,
  icon: Icon,
  checked,
  onChange,
}: {
  label: string;
  icon: typeof IconCircleCheck;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:opacity-80 " +
        (checked
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-red-500/30 bg-red-500/10 text-red-400")
      }
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

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
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-xl max-h-56 overflow-y-auto">
          {suggestions.map((loc) => (
            <button
              key={loc.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b border-border last:border-0"
              onMouseDown={(e) => { e.preventDefault(); onSelect(loc); setOpen(false); }}
            >
              <span className="text-foreground font-medium">{loc.name}</span>
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

function PriceRow({ label, value }: { label: string; value: number | null }) {
  if (value == null || value === 0) return null;
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono tabular-nums text-foreground/80">
        {value.toFixed(2)} &euro;
      </span>
    </div>
  );
}

export function NewOrderForm({ drivers, companies, locations }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [travelCost, setTravelCost] = useState("");
  const [setupCost, setSetupCost] = useState("");
  const [materialCost, setMaterialCost] = useState("-50");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("AMOUNT");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [driverId, setDriverId] = useState("");
  const [secondDriverId, setSecondDriverId] = useState("");
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [designReady, setDesignReady] = useState(false);
  const [planned, setPlanned] = useState(false);
  const [paid, setPaid] = useState(false);
  const [extras, setExtras] = useState<string[]>(["Drucker"]);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const isPrivateLocation = locationName.toLowerCase() === "privat";

  function toggleExtra(key: string) {
    setExtras((prev) => {
      const next = prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key];
      // Auto-set material cost based on Drucker
      if (key === "Drucker") {
        setMaterialCost(next.includes("Drucker") ? "-50" : "");
      }
      return next;
    });
  }

  // Dynamic pricing
  const extrasTotal = useMemo(() => calculateExtrasTotal(extras), [extras]);
  const boxPrice = BOX_PRICE;
  const travelCostNum = travelCost ? Number(travelCost) : 0;
  const customerSubtotal = boxPrice + travelCostNum + extrasTotal;
  const discountNum = discount ? Number(discount) : 0;
  const discountAmount = discountType === "PERCENT"
    ? (customerSubtotal * discountNum) / 100
    : discountNum;
  const customerTotal = customerSubtotal - discountAmount;

  async function handleLocationSelect(loc: LocationOption) {
    setLocationName(loc.name);
    setSelectedLocationId(loc.id);
    const addr = [loc.street, [loc.zip, loc.city].filter(Boolean).join(" ")]
      .filter(Boolean).join(", ");
    setLocationAddress(addr);
    setDistanceKm(loc.distanceKm != null ? String(loc.distanceKm) : "");

    if (loc.distanceKm != null) {
      try {
        const res = await fetch(`/api/travel-pricing/calculate?distanceKm=${loc.distanceKm}`);
        if (res.ok) {
          const data = await res.json();
          setTravelCost(String(data.customerPrice));
          setSetupCost(String(-data.driverCompensation));
        }
      } catch {}
    }
  }

  async function handleSave() {
    if (!customerName || !eventDate || !eventType || !companyId) {
      toast.error("Name, Datum, Eventart und Firma sind Pflichtfelder");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          eventType,
          eventDate,
          locationName,
          locationAddress,
          distanceKm: distanceKm ? Number(distanceKm) : null,
          companyId,
          driverId: driverId || null,
          secondDriverId: secondDriverId || null,
          paymentMethod,
          price: customerTotal,
          boxPrice,
          travelCost: travelCostNum || null,
          extrasCost: extrasTotal || null,
          setupCost: setupCost ? Number(setupCost) : null,
          materialCost: materialCost ? Number(materialCost) : null,
          discount: discountNum || null,
          discountType,
          extras,
          notes,
          internalNotes,
          confirmed,
          designReady,
          planned,
          paid,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Erstellen");
      }

      const order = await res.json();
      toast.success("Auftrag erstellt");
      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler beim Erstellen");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors [&::-webkit-calendar-picker-indicator]:invert";
  const labelClass =
    "block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1";
  const selectClass =
    "h-9 w-full rounded-lg border border-border bg-muted px-2 text-sm text-foreground outline-none focus:border-primary/50 cursor-pointer appearance-none bg-[length:12px] bg-[right_8px_center] bg-no-repeat bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]";

  // Active extras with prices for display
  const activeExtrasWithPrices = extras
    .map((key) => {
      const cfg = EXTRAS_CONFIG.find((e) => e.key === key);
      return { key, label: cfg?.label ?? key, price: EXTRAS_PRICES[key] ?? 0 };
    })
    .filter((e) => e.price > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/orders" className="flex items-center justify-center size-9 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <IconArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Neuer Auftrag</h1>
            <p className="text-sm text-muted-foreground">Auftrag manuell anlegen</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <IconDeviceFloppy className="size-4" />
          {saving ? "Erstellen..." : "Auftrag erstellen"}
        </button>
      </div>

      {/* Status flags */}
      <div className="flex flex-wrap gap-2">
        <StatusToggle label="Bestätigt" icon={IconCircleCheck} checked={confirmed} onChange={setConfirmed} />
        <StatusToggle label="Design" icon={IconPalette} checked={designReady} onChange={setDesignReady} />
        <StatusToggle label="Geplant" icon={IconTruck} checked={planned} onChange={setPlanned} />
        <StatusToggle label="Bezahlt" icon={IconCoin} checked={paid} onChange={setPaid} />
      </div>

      {/* Extras */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground/80">Extras</h2>
        </div>
        <div className="p-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          {EXTRAS_CONFIG.map((ext) => (
            <ExtraToggle
              key={ext.key}
              label={ext.label}
              icon={ext.icon}
              active={extras.includes(ext.key)}
              onClick={() => toggleExtra(ext.key)}
              price={EXTRAS_PRICES[ext.key]}
            />
          ))}
        </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kundendaten */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground/80">Kundendaten</h2>
          </div>
          <div className="p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Name *</label>
              <input className={inputClass} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Vor- und Nachname" />
            </div>
            <div>
              <label className={labelClass}>E-Mail</label>
              <input className={inputClass} type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Telefon</label>
              <input className={inputClass} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Firma *</label>
              <select className={selectClass} value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                {companies.map((c) => (
                  <option key={c.id} value={c.id} className="bg-card">{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          </div>
        </div>

        {/* Event-Details */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground/80">Event-Details</h2>
          </div>
          <div className="p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Eventart *</label>
              <input className={inputClass} value={eventType} onChange={(e) => setEventType(e.target.value)} placeholder="z.B. Hochzeit" />
            </div>
            <div>
              <label className={labelClass}>Datum *</label>
              <input className={inputClass} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Location</label>
              <LocationAutocomplete value={locationName} onChange={(v) => { setLocationName(v); setSelectedLocationId(null); }} onSelect={handleLocationSelect} locations={locations} inputClass={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Adresse</label>
              <input className={inputClass} value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} disabled={!!selectedLocationId && !isPrivateLocation} />
            </div>
            <div>
              <label className={labelClass}>Entfernung (KM)</label>
              <input className={inputClass} type="number" step="0.1" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} disabled={!!selectedLocationId && !isPrivateLocation} placeholder="–" />
            </div>
          </div>
          </div>
        </div>

        {/* Preiskalkulation */}
        <div className="rounded-xl border border-primary/20 bg-card overflow-hidden">
          <div className="border-b border-primary/20 px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground/80">Preiskalkulation</h2>
          </div>
          <div className="p-5 space-y-4">

          {/* Inputs */}
          <div className="grid gap-3 grid-cols-3">
            <div>
              <label className={labelClass}>Fotobox</label>
              <div className="relative">
                <div className={inputClass + " flex items-center bg-transparent text-muted-foreground cursor-default pr-10"}>{boxPrice.toFixed(2)}</div>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground/70">EUR</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Fahrt</label>
              <div className="relative">
                <input className={inputClass + " pr-10"} type="number" step="0.01" value={travelCost} onChange={(e) => setTravelCost(e.target.value)} placeholder="–" />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground/70">EUR</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Extras</label>
              <div className="relative">
                <div className={inputClass + " flex items-center bg-transparent text-muted-foreground cursor-default pr-10"}>{extrasTotal.toFixed(2)}</div>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground/70">EUR</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 grid-cols-3">
            <div className="col-span-2">
              <label className={labelClass}>Rabatt</label>
              <div className="relative">
                <input className={inputClass + " pr-10"} type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground/70">EUR</span>
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

          {/* Live calculation */}
          <div className="rounded-lg bg-muted border border-border p-3 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fotobox</span>
              <span className="tabular-nums">{boxPrice.toFixed(2)} &euro;</span>
            </div>
            {travelCostNum > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fahrt{distanceKm ? ` (${distanceKm} km)` : ""}</span>
                <span className="tabular-nums">{travelCostNum.toFixed(2)} &euro;</span>
              </div>
            )}
            {activeExtrasWithPrices.map((e) => (
              <div key={e.key} className="flex justify-between text-xs text-muted-foreground">
                <span>{e.label}</span>
                <span className="tabular-nums">{e.price.toFixed(2)} &euro;</span>
              </div>
            ))}
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-red-400">
                <span>Rabatt{discountType === "PERCENT" ? ` (${discountNum}%)` : ""}</span>
                <span className="tabular-nums">-{discountAmount.toFixed(2)} &euro;</span>
              </div>
            )}
            <div className="border-t border-border pt-1.5 flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">Gesamtpreis</span>
              <span className="text-lg font-bold text-primary tabular-nums">{customerTotal.toFixed(2)} &euro;</span>
            </div>
          </div>
          </div>
        </div>

        {/* Preiskalkulation intern */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
          <div className="border-b border-amber-500/20 px-5 py-3">
            <h2 className="text-sm font-semibold text-amber-400">Preiskalkulation intern</h2>
          </div>
          <div className="p-5 space-y-4">
          <div className="space-y-0.5">
            <PriceRow label="Kundenpreis" value={customerTotal} />
            {setupCost && (
              <div className="flex items-center justify-between py-0.5">
                <span className="text-sm text-muted-foreground">abzgl. Aufbau (Vergütung)</span>
                <span className="text-sm font-mono tabular-nums text-red-400">
                  {Math.abs(Number(setupCost)).toFixed(2)} &euro;
                </span>
              </div>
            )}
            {materialCost && (
              <div className="flex items-center justify-between py-0.5">
                <span className="text-sm text-muted-foreground">abzgl. Material</span>
                <span className="text-sm font-mono tabular-nums text-red-400">
                  {Math.abs(Number(materialCost)).toFixed(2)} &euro;
                </span>
              </div>
            )}
            <div className="border-t border-amber-500/20 mt-2 pt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Gewinn</span>
              {(() => {
                const profit = customerTotal - Math.abs(Number(setupCost) || 0) - Math.abs(Number(materialCost) || 0);
                return (
                  <span className={"text-base font-bold font-mono tabular-nums " + (profit >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {profit.toFixed(2)} &euro;
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="border-t border-amber-500/20 pt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Aufbau (Vergütung)</label>
              <input className={inputClass} type="number" step="0.01" value={setupCost} onChange={(e) => setSetupCost(e.target.value)} placeholder="–" />
            </div>
            <div>
              <label className={labelClass}>Material</label>
              <input className={inputClass} type="number" step="0.01" value={materialCost} onChange={(e) => setMaterialCost(e.target.value)} placeholder="–" />
            </div>
          </div>
          </div>
        </div>

        {/* Zuordnung & Zahlart */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground/80">Zuordnung &amp; Zahlung</h2>
          </div>
          <div className="p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Fahrer</label>
              <select className={selectClass} value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                <option value="" className="bg-card">– Kein Fahrer –</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id} className="bg-card">{d.name} {d.initials ? `(${d.initials})` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>2. Fahrer</label>
              <select className={selectClass} value={secondDriverId} onChange={(e) => setSecondDriverId(e.target.value)}>
                <option value="" className="bg-card">– Kein 2. Fahrer –</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id} className="bg-card">{d.name} {d.initials ? `(${d.initials})` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Zahlart</label>
              <select className={selectClass} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="CASH" className="bg-card">Bar</option>
                <option value="INVOICE" className="bg-card">Rechnung</option>
              </select>
            </div>
          </div>
          </div>
        </div>

        {/* Notizen */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground/80">Notizen</h2>
          </div>
          <div className="p-5 space-y-4">
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Kundenkommentar</label>
              <textarea className={inputClass + " h-20 py-2 resize-none"} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sichtbar für den Kunden..." />
            </div>
            <div>
              <label className={labelClass}>Interner Kommentar</label>
              <textarea className={inputClass + " h-20 py-2 resize-none"} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Nur intern sichtbar..." />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
