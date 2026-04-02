"use client";

/**
 * Entwurf B: Full-Width Sections Layout
 * - Großer Header mit Datum, Name, Location
 * - Kontakt als kompakte Inline-Chips
 * - Full-Width Sections: Extras, Preis-Grid, Notizen, Galerie
 * - Responsive: Alles stacked, natürlicher Flow
 */

import Link from "next/link";
import {
  IconArrowLeft,
  IconEdit,
  IconMapPin,
  IconCalendar,
  IconMail,
  IconPhoneCall,
  IconSteeringWheel,
  IconCash,
  IconBuildingStore,
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
import { EXTRAS_PRICES } from "@/lib/extras-pricing";
import { ImageGallery } from "./image-gallery";

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
  driverId: string | null;
  driverName: string | null;
  secondDriverId: string | null;
  secondDriverName: string | null;
  companyName: string;
  extras: string[];
  notes: string | null;
  internalNotes: string | null;
  confirmed: boolean;
  designReady: boolean;
  planned: boolean;
  paid: boolean;
  distanceKm: number | null;
  images: string[];
};

type Props = {
  order: Order;
  drivers: { id: string; name: string; initials: string | null }[];
  isAdmin: boolean;
  viewMode?: string;
  onEdit: () => void;
};

export function OrderViewB({ order, drivers, isAdmin, viewMode, onEdit }: Props) {
  const dateObj = new Date(order.eventDate);
  const weekday = dateObj.toLocaleDateString("de-DE", { weekday: "long" });
  const dateStr = dateObj.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

  const { firma, kontakt } = (() => {
    const sep = order.customerName.indexOf(" - ");
    return sep >= 0
      ? { firma: order.customerName.slice(0, sep), kontakt: order.customerName.slice(sep + 3) }
      : { firma: null, kontakt: order.customerName };
  })();

  const ort = order.locationAddress.match(/\d{5}\s+(.+)$/)?.[1] ?? "";

  const driverLabel = (() => {
    const d1 = drivers.find((d) => d.id === order.driverId);
    const d2 = drivers.find((d) => d.id === order.secondDriverId);
    if (!d1) return null;
    return d2 ? `${d1.initials ?? d1.name} / ${d2.initials ?? d2.name}` : (d1.initials ?? d1.name);
  })();

  const activeExtras = order.extras
    .map((key) => {
      const cfg = EXTRAS_CONFIG.find((e) => e.key === key);
      return cfg ? { ...cfg, price: EXTRAS_PRICES[key] ?? 0 } : null;
    })
    .filter(Boolean) as { key: string; label: string; icon: typeof IconPrinter; price: number }[];

  const customerSubtotal = (order.boxPrice ?? 0) + (order.travelCost ?? 0) + (order.extrasCost ?? 0);
  const discountAmount = order.discount
    ? order.discountType === "PERCENT" ? (customerSubtotal * order.discount) / 100 : order.discount
    : 0;
  const customerTotal = customerSubtotal - discountAmount;
  const internalProfit = customerTotal - Math.abs(order.setupCost ?? 0) - Math.abs(order.materialCost ?? 0);
  const showInternal = viewMode !== "accounting" && viewMode !== "driver";

  const statusFlags = [
    { label: "Bestätigt", icon: IconCircleCheck, done: order.confirmed },
    { label: "Design", icon: IconPalette, done: order.designReady },
    { label: "Geplant", icon: IconTruck, done: order.planned },
    { label: "Bezahlt", icon: IconCoin, done: order.paid },
  ];

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <Link
          href="/orders"
          className="flex items-center justify-center size-9 rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200 transition-colors mt-1"
        >
          <IconArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-600">#{order.orderNumber}</span>
          {isAdmin && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 h-9 px-4 rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-300 text-sm font-medium hover:bg-white/[0.06] transition-colors"
            >
              <IconEdit className="size-4" />
              Bearbeiten
            </button>
          )}
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <IconCalendar className="size-4 text-[#F6A11C]" />
          <span className="text-[#F6A11C] font-medium">{weekday}, {dateStr}</span>
          <span className="text-zinc-600">&middot;</span>
          <span className="text-zinc-400">{order.eventType}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 leading-tight">
          {kontakt}
        </h1>

        {firma && (
          <p className="text-lg text-zinc-400">{firma}</p>
        )}

        <div className="flex items-center gap-2 text-zinc-400">
          <IconMapPin className="size-4 shrink-0" />
          <span className="text-base font-medium text-zinc-300">{order.locationName}</span>
          {ort && <span className="text-zinc-500">&middot; {ort}</span>}
          {order.distanceKm != null && <span className="text-zinc-600">&middot; {order.distanceKm} km</span>}
        </div>
      </div>

      {/* ── Status + Kontakt Bar ── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
        {/* Status */}
        <div className="flex flex-wrap gap-2">
          {statusFlags.map((s) => (
            <div
              key={s.label}
              className={
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium " +
                (s.done
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/20 bg-red-500/5 text-red-400/60")
              }
            >
              <s.icon className="size-3.5" />
              {s.label}
            </div>
          ))}
        </div>

        {/* Contact chips */}
        <div className="border-t border-white/[0.06] pt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {order.customerEmail && order.customerEmail !== "unbekannt@import.local" && (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <IconMail className="size-3.5 text-zinc-600" />
              {order.customerEmail}
            </span>
          )}
          {order.customerPhone && (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <IconPhoneCall className="size-3.5 text-zinc-600" />
              {order.customerPhone}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-zinc-400">
            <IconSteeringWheel className="size-3.5 text-zinc-600" />
            {driverLabel ?? <span className="text-zinc-600 italic">Kein Fahrer</span>}
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <IconCash className="size-3.5 text-zinc-600" />
            {order.paymentMethod === "CASH" ? "Bar" : "Rechnung"}
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <IconBuildingStore className="size-3.5 text-zinc-600" />
            {order.companyName.includes("GbR") ? "GbR" : "EU"}
          </span>
        </div>
      </div>

      {/* ── Extras ── */}
      {activeExtras.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeExtras.map((ext) => (
            <div
              key={ext.key}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-[#F6A11C]/30 bg-[#F6A11C]/10 p-2.5 min-w-[70px] text-[#F6A11C]"
            >
              <ext.icon className="size-5" />
              <span className="text-[9px] font-bold uppercase tracking-wide">{ext.label}</span>
              {ext.price > 0 && <span className="text-[9px] font-mono opacity-60">{ext.price}&euro;</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── Preis Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">Kundenpreis</h3>
          <div className="space-y-1">
            {order.boxPrice != null && <PriceRow label="Fotobox" value={order.boxPrice} />}
            {order.travelCost != null && <PriceRow label="Fahrtkosten" value={order.travelCost} />}
            {activeExtras.filter(e => e.price > 0).map((e) => (
              <PriceRow key={e.key} label={e.label} value={e.price} />
            ))}
            {discountAmount > 0 && (
              <div className="flex items-center justify-between py-0.5">
                <span className="text-sm text-red-400">Rabatt</span>
                <span className="text-sm font-mono tabular-nums text-red-400">&minus;{discountAmount.toFixed(2)}&euro;</span>
              </div>
            )}
            <div className="border-t border-white/[0.06] mt-2 pt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">Gesamt</span>
              <span className="text-xl font-bold font-mono tabular-nums text-[#F6A11C]">{customerTotal.toFixed(2)}&euro;</span>
            </div>
          </div>
        </div>

        {showInternal && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-3">Intern</h3>
            <div className="space-y-1">
              <PriceRow label="Kundenpreis" value={customerTotal} />
              {order.setupCost != null && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-sm text-zinc-400">Aufbau</span>
                  <span className="text-sm font-mono tabular-nums text-red-400">{Math.abs(order.setupCost).toFixed(2)}&euro;</span>
                </div>
              )}
              {order.materialCost != null && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-sm text-zinc-400">Material</span>
                  <span className="text-sm font-mono tabular-nums text-red-400">{Math.abs(order.materialCost).toFixed(2)}&euro;</span>
                </div>
              )}
              <div className="border-t border-amber-500/20 mt-2 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-200">Gewinn</span>
                <span className={"text-xl font-bold font-mono tabular-nums " + (internalProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {internalProfit.toFixed(2)}&euro;
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Notizen ── */}
      {(order.notes || (order.internalNotes && showInternal)) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {order.notes && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">Kundenkommentar</h3>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
          {order.internalNotes && showInternal && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-2">Intern</h3>
              <p className="text-sm text-zinc-400 whitespace-pre-wrap">{order.internalNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Drucklayouts ── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">Drucklayouts</h3>
        <ImageGallery orderId={order.id} images={order.images} isAdmin={isAdmin} />
      </div>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-mono tabular-nums text-zinc-300">{value.toFixed(2)}&euro;</span>
    </div>
  );
}
