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
  IconEdit,
  IconX,
  IconMail,
  IconPhoneCall,
  IconCalendar,
  IconMapPin,
  IconBuildingStore,
  IconCash,
  IconSteeringWheel,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { BOX_PRICE, EXTRAS_PRICES, calculateExtrasTotal } from "@/lib/extras-pricing";
import { ImageGallery } from "./image-gallery";
import { OrderViewA } from "./order-view-a";
import { useViewMode } from "@/lib/view-mode-context";

type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  eventType: string;
  eventDate: string;
  locationName: string;
  locationAddress: string;
  price: number;
  travelCost: number | null;
  boxPrice: number | null;
  extrasCost: number | null;
  setupCost: number | null;
  materialCost: number | null;
  discount: number | null;
  discountType: string | null;
  paymentMethod: string;
  status: string;
  driverId: string | null;
  driverName: string | null;
  secondDriverId: string | null;
  secondDriverName: string | null;
  companyId: string;
  companyName: string;
  extras: string[];
  notes: string | null;
  internalNotes: string | null;
  confirmed: boolean;
  designReady: boolean;
  planned: boolean;
  paid: boolean;
  distanceKm: number | null;
  setupDate: string | null;
  setupTime: string | null;
  teardownDate: string | null;
  teardownTime: string | null;
  images: string[];
  graphicUrl: string | null;
  confirmationToken: string | null;
  confirmedByCustomerAt: string | null;
  locationId: string | null;
};

type LocationOption = {
  id: string;
  name: string;
  street: string | null;
  zip: string | null;
  city: string | null;
  distanceKm: number | null;
};

type Props = {
  order: Order;
  drivers: { id: string; name: string; initials: string | null }[];
  companies: { id: string; name: string }[];
  locations: LocationOption[];
  isAdmin: boolean;
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

function ExtraIcon({
  label,
  icon: Icon,
  active,
  onClick,
  editable,
  price,
}: {
  label: string;
  icon: typeof IconMask;
  active: boolean;
  onClick?: () => void;
  editable: boolean;
  price?: number;
}) {
  const Tag = editable ? "button" : "div";
  return (
    <Tag
      type={editable ? "button" : undefined}
      onClick={editable ? onClick : undefined}
      className={
        "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 min-w-[80px] transition-colors " +
        (active
          ? "border-[#F6A11C]/40 bg-[#F6A11C]/10 text-[#F6A11C]"
          : "border-white/[0.10] bg-card text-zinc-400") +
        (editable ? " cursor-pointer hover:opacity-80" : "")
      }
    >
      <Icon className="size-7" />
      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </span>
      {price != null && price > 0 && active && (
        <span className="text-[10px] font-mono tabular-nums opacity-70">
          {price} &euro;
        </span>
      )}
    </Tag>
  );
}

function StatusToggle({
  label,
  icon: Icon,
  checked,
  onChange,
  editable,
}: {
  label: string;
  icon: typeof IconCircleCheck;
  checked: boolean;
  onChange: (v: boolean) => void;
  editable: boolean;
}) {
  const Tag = editable ? "button" : "div";
  return (
    <Tag
      type={editable ? "button" : undefined}
      onClick={editable ? () => onChange(!checked) : undefined}
      className={
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors " +
        (checked
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-red-500/30 bg-red-500/10 text-red-400") +
        (editable ? " cursor-pointer hover:opacity-80" : "")
      }
    >
      <Icon className="size-4" />
      {label}
    </Tag>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof IconMail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      {Icon && <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm text-zinc-200 break-words">{value || "–"}</p>
      </div>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-mono tabular-nums text-zinc-300">
        {value != null ? `${value.toFixed(2)} €` : "–"}
      </span>
    </div>
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
    return locations
      .filter((l) => l.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [value, locations]);

  return (
    <div className="relative">
      <input
        className={inputClass}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
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
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(loc);
                setOpen(false);
              }}
            >
              <span className="text-zinc-200 font-medium">{loc.name}</span>
              {loc.city && (
                <span className="text-muted-foreground ml-2">
                  {loc.street ? `${loc.street}, ` : ""}
                  {loc.zip} {loc.city}
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

export function OrderDetail({ order, drivers, companies, locations, isAdmin }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState(order.customerName);
  const [customerEmail, setCustomerEmail] = useState(order.customerEmail);
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone ?? "");
  const [eventType, setEventType] = useState(order.eventType);
  const [eventDate, setEventDate] = useState(order.eventDate.slice(0, 10));
  const [locationName, setLocationName] = useState(order.locationName);
  const [locationAddress, setLocationAddress] = useState(order.locationAddress);
  const [distanceKm, setDistanceKm] = useState(order.distanceKm != null ? String(order.distanceKm) : "");
  const isPrivateLocation = locationName.toLowerCase() === "privat";

  async function handleLocationSelect(loc: LocationOption) {
    setLocationName(loc.name);
    const addr = [loc.street, [loc.zip, loc.city].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", ");
    setLocationAddress(addr);
    setDistanceKm(loc.distanceKm != null ? String(loc.distanceKm) : "");

    // Auto-fill travel cost + driver compensation from pricing tiers
    if (loc.distanceKm != null) {
      try {
        const res = await fetch(
          `/api/travel-pricing/calculate?distanceKm=${loc.distanceKm}`
        );
        if (res.ok) {
          const data = await res.json();
          setTravelCost(String(data.customerPrice));
          setSetupCost(String(-data.driverCompensation));
        }
      } catch {
        // Silently fail - user can still enter manually
      }
    }
  }
  const [price, setPrice] = useState(String(order.price));
  const [travelCost, setTravelCost] = useState(order.travelCost != null ? String(order.travelCost) : "");
  const [boxPrice, setBoxPrice] = useState(order.boxPrice != null ? String(order.boxPrice) : "");
  const [extrasCost, setExtrasCost] = useState(order.extrasCost != null ? String(order.extrasCost) : "");
  const [setupCost, setSetupCost] = useState(order.setupCost != null ? String(order.setupCost) : "");
  const [materialCost, setMaterialCost] = useState(order.materialCost != null ? String(order.materialCost) : "");
  const [discount, setDiscount] = useState(order.discount != null ? String(order.discount) : "");
  const [discountType, setDiscountType] = useState(order.discountType ?? "AMOUNT");
  const [paymentMethod, setPaymentMethod] = useState(order.paymentMethod);
  const [driverId, setDriverId] = useState(order.driverId ?? "");
  const [secondDriverId, setSecondDriverId] = useState(order.secondDriverId ?? "");
  const [companyId, setCompanyId] = useState(order.companyId);
  const [notes, setNotes] = useState(order.notes ?? "");
  const [internalNotes, setInternalNotes] = useState(order.internalNotes ?? "");
  const [confirmed, setConfirmed] = useState(order.confirmed);
  const [designReady, setDesignReady] = useState(order.designReady);
  const [planned, setPlanned] = useState(order.planned);
  const [paid, setPaid] = useState(order.paid);
  const [extras, setExtras] = useState<string[]>(order.extras);

  function toggleExtra(key: string) {
    setExtras((prev) => {
      const next = prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key];
      // Auto-update extras cost
      setExtrasCost(String(calculateExtrasTotal(next)));
      return next;
    });
  }

  // Computed pricing
  const calcBoxPrice = Number(boxPrice) || 0;
  const calcTravelCost = Number(travelCost) || 0;
  const calcExtrasCost = Number(extrasCost) || 0;
  const calcSubtotal = calcBoxPrice + calcTravelCost + calcExtrasCost;
  const calcDiscount = Number(discount) || 0;
  const calcDiscountAmount = discountType === "PERCENT"
    ? (calcSubtotal * calcDiscount) / 100
    : calcDiscount;
  const calcTotal = calcSubtotal - calcDiscountAmount;

  function recalcPrice() {
    setPrice(String(Math.round(calcTotal * 100) / 100));
  }

  function handleCancel() {
    // Reset all fields to original
    setCustomerName(order.customerName);
    setCustomerEmail(order.customerEmail);
    setCustomerPhone(order.customerPhone ?? "");
    setEventType(order.eventType);
    setEventDate(order.eventDate.slice(0, 10));
    setLocationName(order.locationName);
    setLocationAddress(order.locationAddress);
    setDistanceKm(order.distanceKm != null ? String(order.distanceKm) : "");
    setPrice(String(order.price));
    setTravelCost(order.travelCost != null ? String(order.travelCost) : "");
    setBoxPrice(order.boxPrice != null ? String(order.boxPrice) : "");
    setExtrasCost(order.extrasCost != null ? String(order.extrasCost) : "");
    setSetupCost(order.setupCost != null ? String(order.setupCost) : "");
    setMaterialCost(order.materialCost != null ? String(order.materialCost) : "");
    setDiscount(order.discount != null ? String(order.discount) : "");
    setDiscountType(order.discountType ?? "AMOUNT");
    setPaymentMethod(order.paymentMethod);
    setDriverId(order.driverId ?? "");
    setSecondDriverId(order.secondDriverId ?? "");
    setCompanyId(order.companyId);
    setNotes(order.notes ?? "");
    setInternalNotes(order.internalNotes ?? "");
    setConfirmed(order.confirmed);
    setDesignReady(order.designReady);
    setPlanned(order.planned);
    setPaid(order.paid);
    setExtras(order.extras);
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          eventType,
          eventDate,
          locationName,
          locationAddress,
          price: Number(price),
          travelCost: travelCost ? Number(travelCost) : null,
          boxPrice: boxPrice ? Number(boxPrice) : null,
          extrasCost: extrasCost ? Number(extrasCost) : null,
          setupCost: setupCost ? Number(setupCost) : null,
          materialCost: materialCost ? Number(materialCost) : null,
          discount: discount ? Number(discount) : null,
          discountType,
          paymentMethod,
          driverId: driverId || null,
          secondDriverId: secondDriverId || null,
          companyId,
          notes,
          internalNotes,
          extras,
          confirmed,
          designReady,
          planned,
          paid,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Speichern");
      }

      toast.success("Auftrag gespeichert");
      setEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
      );
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

  const driverLabel = (() => {
    const d1 = drivers.find((d) => d.id === driverId);
    const d2 = drivers.find((d) => d.id === secondDriverId);
    if (!d1) return "Nicht zugewiesen";
    return d2 ? `${d1.name} / ${d2.name}` : d1.name;
  })();

  // Price calculations
  const customerSubtotal =
    (order.boxPrice ?? 0) + (order.travelCost ?? 0) + (order.extrasCost ?? 0);
  const discountAmount =
    order.discount != null
      ? order.discountType === "PERCENT"
        ? (customerSubtotal * order.discount) / 100
        : order.discount
      : 0;
  const customerTotal = customerSubtotal - discountAmount;
  const internalProfit =
    customerTotal - Math.abs(order.setupCost ?? 0) - Math.abs(order.materialCost ?? 0);

  // Active extras with individual prices for display
  const activeExtrasWithPrices = order.extras
    .map((key) => {
      const cfg = EXTRAS_CONFIG.find((e) => e.key === key);
      return { key, label: cfg?.label ?? key, price: EXTRAS_PRICES[key] ?? 0 };
    })
    .filter((e) => e.price > 0);

  const formattedDate = new Date(order.eventDate).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const { viewMode } = useViewMode();
  // ──────────────────── VIEW MODE ────────────────────
  if (!editing) {
    return (
      <OrderViewA
        order={{ ...order, extras, images: order.images, confirmed, designReady, planned, paid }}
        drivers={drivers}
        isAdmin={isAdmin}
        viewMode={viewMode}
        onEdit={() => setEditing(true)}
      />
    );
  }

  // Legacy view code below is no longer used but kept for edit mode reference
  if (false) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="flex items-center justify-center size-9 rounded-lg border border-white/[0.08] bg-[#1c1d20] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <IconArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">
                Auftrag #{order.orderNumber}
              </h1>
              <p className="text-sm text-muted-foreground">
                {order.customerName} &middot; {order.eventType}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-lg border border-white/[0.08] bg-[#1c1d20] text-zinc-300 text-sm font-medium hover:bg-[#222326] transition-colors"
            >
              <IconEdit className="size-4" />
              Bearbeiten
            </button>
          )}
        </div>

        {/* Status flags */}
        <div className="flex flex-wrap gap-2">
          <StatusToggle label="Bestätigt" icon={IconCircleCheck} checked={confirmed} onChange={() => {}} editable={false} />
          <StatusToggle label="Design" icon={IconPalette} checked={designReady} onChange={() => {}} editable={false} />
          <StatusToggle label="Geplant" icon={IconTruck} checked={planned} onChange={() => {}} editable={false} />
          <StatusToggle label="Bezahlt" icon={IconCoin} checked={paid} onChange={() => {}} editable={false} />
        </div>

        {/* Extras */}
        <div className="rounded-xl border border-white/[0.10] bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300">Extras</h2>
          <div className="flex flex-wrap gap-2">
            {EXTRAS_CONFIG.map((ext) => (
              <ExtraIcon
                key={ext.key}
                label={ext.label}
                icon={ext.icon}
                active={extras.includes(ext.key)}
                editable={false}
                price={EXTRAS_PRICES[ext.key]}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Kunde & Event */}
          <div className="rounded-xl border border-white/[0.10] bg-card p-5 space-y-1">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">
              Kunde &amp; Event
            </h2>
            <DetailRow icon={IconCircleCheck} label="Kunde" value={customerName} />
            <DetailRow icon={IconMail} label="E-Mail" value={customerEmail} />
            <DetailRow icon={IconPhoneCall} label="Telefon" value={customerPhone} />
            <DetailRow icon={IconCalendar} label="Datum" value={formattedDate} />
            <DetailRow icon={IconBuildingStore} label="Eventart" value={eventType} />
          </div>

          {/* Location */}
          <div className="rounded-xl border border-white/[0.10] bg-card p-5 space-y-1">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">
              Location
            </h2>
            <DetailRow icon={IconMapPin} label="Name" value={locationName} />
            <DetailRow icon={IconMapPin} label="Adresse" value={locationAddress} />
            <DetailRow label="KM" value={order.distanceKm != null ? `${order.distanceKm} km` : "–"} />
          </div>

          {/* Zuordnung */}
          <div className="rounded-xl border border-white/[0.10] bg-card p-5 space-y-1">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">
              Zuordnung
            </h2>
            <DetailRow icon={IconSteeringWheel} label="Fahrer" value={driverLabel} />
            <DetailRow icon={IconCash} label="Zahlart" value={paymentMethod === "CASH" ? "Bar" : "Rechnung"} />
            <DetailRow icon={IconBuildingStore} label="Firma" value={order.companyName} />
          </div>
        </div>

        {/* Preiskalkulationen */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Kunde */}
          <div className="rounded-xl border border-white/[0.10] bg-card p-5 space-y-2">
            <h2 className="text-sm font-semibold text-zinc-300 mb-2">
              Preiskalkulation Kunde
            </h2>
            <div className="space-y-0.5">
              <PriceRow label="Fotobox" value={order.boxPrice} />
              <PriceRow label="Fahrtkosten" value={order.travelCost} />
              {activeExtrasWithPrices.map((e) => (
                <PriceRow key={e.key} label={e.label} value={e.price} />
              ))}
              {customerSubtotal > 0 && discountAmount > 0 && (
                <>
                  <div className="border-t border-white/[0.10] mt-2 pt-2">
                    <PriceRow label="Zwischensumme" value={customerSubtotal} />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-red-400">
                      Rabatt {order.discountType === "PERCENT" && order.discount ? `(${order.discount}%)` : ""}
                    </span>
                    <span className="text-sm font-mono tabular-nums text-red-400">
                      &minus;{discountAmount.toFixed(2)} &euro;
                    </span>
                  </div>
                </>
              )}
              <div className="border-t border-white/[0.10] mt-2 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-200">Kundenpreis</span>
                <span className="text-base font-bold font-mono tabular-nums text-[#F6A11C]">
                  {customerTotal.toFixed(2)} &euro;
                </span>
              </div>
            </div>
          </div>

          {/* Intern */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-2">
            <h2 className="text-sm font-semibold text-amber-400 mb-2">
              Preiskalkulation intern
            </h2>
            <div className="space-y-0.5">
              <PriceRow label="Kundenpreis" value={customerTotal} />
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">abzgl. Aufbau</span>
                <span className="text-sm font-mono tabular-nums text-red-400">
                  {order.setupCost ? `−${Math.abs(order.setupCost as number).toFixed(2)} €` : "–"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">abzgl. Material</span>
                <span className="text-sm font-mono tabular-nums text-red-400">
                  {order.materialCost ? `−${Math.abs(order.materialCost as number).toFixed(2)} €` : "–"}
                </span>
              </div>
              <div className="border-t border-amber-500/20 mt-2 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-200">Gewinn</span>
                <span className={"text-base font-bold font-mono tabular-nums " + (internalProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {internalProfit.toFixed(2)} &euro;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notizen */}
        {(order.notes || order.internalNotes) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {order.notes && (
              <div className="rounded-xl border border-white/[0.10] bg-card p-5">
                <h2 className="text-sm font-semibold text-zinc-300 mb-2">
                  Kundenkommentar
                </h2>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap">
                  {order.notes}
                </p>
              </div>
            )}
            {order.internalNotes && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                <h2 className="text-sm font-semibold text-amber-400 mb-2">
                  Interner Kommentar
                </h2>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap">
                  {order.internalNotes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Drucklayouts */}
        <div className="rounded-xl border border-white/[0.10] bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300">Drucklayouts</h2>
          <ImageGallery
            orderId={order.id}
            images={order.images}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    );
  }

  // ──────────────────── EDIT MODE ────────────────────
  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center justify-center size-9 rounded-lg border border-white/[0.08] bg-[#1c1d20] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <IconX className="size-4" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-100">
              Auftrag #{order.orderNumber}
              <span className="ml-2 text-sm font-normal text-[#F6A11C]">
                Bearbeiten
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="h-9 px-4 rounded-lg border border-white/[0.08] bg-[#1c1d20] text-zinc-400 text-sm font-medium hover:text-zinc-200 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 disabled:opacity-50 transition-colors"
            >
              <IconDeviceFloppy className="size-4" />
              {saving ? "Speichern..." : "Speichern"}
            </button>
          </div>
        </div>
      </div>

      {/* Status flags */}
      <div className="flex flex-wrap gap-2">
        <StatusToggle label="Bestätigt" icon={IconCircleCheck} checked={confirmed} onChange={setConfirmed} editable />
        <StatusToggle label="Design" icon={IconPalette} checked={designReady} onChange={setDesignReady} editable />
        <StatusToggle label="Geplant" icon={IconTruck} checked={planned} onChange={setPlanned} editable />
        <StatusToggle label="Bezahlt" icon={IconCoin} checked={paid} onChange={setPaid} editable />
      </div>

      {/* Section 1: Event & Location */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event &amp; Location</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Eventart</label>
            <input className={inputClass} value={eventType} onChange={(e) => setEventType(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Datum</label>
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
            <input
              className={inputClass}
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              disabled={!isPrivateLocation}
            />
          </div>
          <div>
            <label className={labelClass}>Entfernung (KM)</label>
            <input
              className={inputClass}
              type="number"
              step="0.1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              disabled={!isPrivateLocation}
              placeholder="–"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Kunde */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kunde</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Name</label>
            <input className={inputClass} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
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
            <label className={labelClass}>Firma</label>
            <select className={selectClass} value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
              {companies.map((c) => (
                <option key={c.id} value={c.id} className="bg-card">{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Extras */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Extras</h2>
        <div className="flex flex-wrap gap-2">
          {EXTRAS_CONFIG.map((ext) => (
            <ExtraIcon
              key={ext.key}
              label={ext.label}
              icon={ext.icon}
              active={extras.includes(ext.key)}
              onClick={() => toggleExtra(ext.key)}
              editable
              price={EXTRAS_PRICES[ext.key]}
            />
          ))}
        </div>
      </div>

      {/* Section 4: Preise */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preiskalkulation</h2>

        {/* Price inputs */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Fotobox</label>
            <input className={inputClass} type="number" step="0.01" value={boxPrice} onChange={(e) => setBoxPrice(e.target.value)} placeholder="–" />
          </div>
          <div>
            <label className={labelClass}>Fahrt</label>
            <input className={inputClass} type="number" step="0.01" value={travelCost} onChange={(e) => setTravelCost(e.target.value)} placeholder="–" />
          </div>
          <div>
            <label className={labelClass}>Extras ({extras.length})</label>
            <input className={inputClass} type="number" step="0.01" value={extrasCost} onChange={(e) => setExtrasCost(e.target.value)} placeholder="–" />
          </div>
        </div>

        {/* Rabatt */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>Rabatt</label>
            <input className={inputClass} type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className={labelClass}>Typ</label>
            <select className={selectClass} value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
              <option value="AMOUNT" className="bg-card">&euro; Betrag</option>
              <option value="PERCENT" className="bg-card">% Prozent</option>
            </select>
          </div>
        </div>

        {/* Live calculation summary */}
        <div className="rounded-lg bg-[#1c1d20] border border-white/[0.06] p-3 space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Fotobox</span>
            <span className="tabular-nums">{calcBoxPrice.toFixed(2)} &euro;</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Fahrt</span>
            <span className="tabular-nums">{calcTravelCost.toFixed(2)} &euro;</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Extras</span>
            <span className="tabular-nums">{calcExtrasCost.toFixed(2)} &euro;</span>
          </div>
          {calcDiscount > 0 && (
            <div className="flex justify-between text-xs text-red-400">
              <span>Rabatt{discountType === "PERCENT" ? ` (${calcDiscount}%)` : ""}</span>
              <span className="tabular-nums">-{calcDiscountAmount.toFixed(2)} &euro;</span>
            </div>
          )}
          <div className="border-t border-white/[0.10] pt-1.5 flex justify-between text-sm font-semibold">
            <span className="text-zinc-300">Kalkuliert</span>
            <span className="text-[#F6A11C] tabular-nums">{calcTotal.toFixed(2)} &euro;</span>
          </div>
        </div>

        {/* Gesamtpreis with auto-calc button */}
        <div>
          <label className={labelClass}>Gesamtpreis</label>
          <div className="flex gap-2">
            <input className={inputClass + " font-semibold text-[#F6A11C] text-lg h-11 flex-1"} type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            <button
              type="button"
              onClick={recalcPrice}
              className="h-11 px-3 rounded-lg border border-[#F6A11C]/30 bg-[#F6A11C]/10 text-[#F6A11C] text-xs font-semibold hover:bg-[#F6A11C]/20 transition-colors whitespace-nowrap"
              title="Preis aus Kalkulation übernehmen"
            >
              &#x21BB; Berechnen
            </button>
          </div>
          {Math.abs(Number(price) - calcTotal) > 0.01 && Number(price) > 0 && calcTotal > 0 && (
            <p className="text-[11px] text-amber-400 mt-1">
              Abweichung: {(Number(price) - calcTotal).toFixed(2)} &euro; vom kalkulierten Preis
            </p>
          )}
        </div>

        {/* Interne Kosten */}
        <div className="border-t border-white/[0.10] pt-3">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Interne Kosten</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Aufbau / Fahrer</label>
                <input className={inputClass} type="number" step="0.01" value={setupCost} onChange={(e) => setSetupCost(e.target.value)} placeholder="–" />
              </div>
              <div>
                <label className={labelClass}>Material</label>
                <input className={inputClass} type="number" step="0.01" value={materialCost} onChange={(e) => setMaterialCost(e.target.value)} placeholder="–" />
              </div>
            </div>
            {Number(price) > 0 && (
              <div className="flex justify-between text-xs pt-1 border-t border-amber-500/10">
                <span className="text-amber-400/70">Marge</span>
                <span className="text-amber-400 font-semibold tabular-nums">
                  {(Number(price) - Math.abs(Number(setupCost) || 0) - Math.abs(Number(materialCost) || 0)).toFixed(2)} &euro;
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 5: Zuordnung & Zahlung */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zuordnung &amp; Zahlung</h2>
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
        </div>
        <div>
          <label className={labelClass}>Zahlart</label>
          <select className={selectClass} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="CASH" className="bg-card">Bar</option>
            <option value="INVOICE" className="bg-card">Rechnung</option>
          </select>
        </div>
      </div>

      {/* Section 6: Notizen */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notizen</h2>
        <div>
          <label className={labelClass}>Kundenkommentar</label>
          <textarea
            className={inputClass + " h-24 py-2 resize-none"}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Sichtbar für den Kunden..."
          />
        </div>
        <div>
          <label className={labelClass}>Interner Kommentar</label>
          <textarea
            className={inputClass + " h-24 py-2 resize-none"}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Nur intern sichtbar..."
          />
        </div>
      </div>

      {/* Section 7: Drucklayouts */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Drucklayouts</h2>
        <ImageGallery
          orderId={order.id}
          images={order.images}
          isAdmin={isAdmin}
        />
      </div>

      {/* Mobile floating save button */}
      <div className="fixed bottom-4 left-4 right-4 sm:hidden z-20">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-xl bg-[#F6A11C] text-black font-semibold text-base shadow-lg shadow-[#F6A11C]/20 hover:bg-[#F6A11C]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <IconDeviceFloppy className="size-5" />
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>
    </div>
  );
}
