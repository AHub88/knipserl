"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  IconMessageCircle,
  IconAlertCircle,
  IconExternalLink,
  IconClock,
  IconPencil,
  IconCheck,
  IconX,
  IconFileDownload,
  IconLink,
  IconCircleCheckFilled,
} from "@tabler/icons-react";
import { toast } from "sonner";
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
  setupDate: string | null;
  setupTime: string | null;
  teardownDate: string | null;
  teardownTime: string | null;
  images: string[];
  confirmationToken?: string | null;
  confirmedByCustomerAt?: string | null;
  designToken?: string | null;
  locationId?: string | null;
};

type Props = {
  order: Order;
  drivers: { id: string; name: string; initials: string | null }[];
  isAdmin: boolean;
  viewMode?: string;
  onEdit: () => void;
};

function formatDateShort(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
}

export function OrderViewA({ order, drivers, isAdmin, viewMode, onEdit }: Props) {
  const router = useRouter();

  // Inline edit states
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingExtras, setEditingExtras] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingInternal, setEditingInternal] = useState(false);

  const [statusState, setStatusState] = useState({
    confirmed: order.confirmed,
    designReady: order.designReady,
    planned: order.planned,
    paid: order.paid,
  });
  const [extrasState, setExtrasState] = useState<string[]>(order.extras);
  const [notesState, setNotesState] = useState(order.notes ?? "");
  const [internalState, setInternalState] = useState(order.internalNotes ?? "");

  async function saveField(data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Gespeichert");
      // Update local state from what we just saved
      if ("confirmed" in data) setStatusState(data as typeof statusState);
      if ("extras" in data) setExtrasState(data.extras as string[]);
      if ("notes" in data) setNotesState((data.notes as string) ?? "");
      if ("internalNotes" in data) setInternalState((data.internalNotes as string) ?? "");
      router.refresh();
    } catch {
      toast.error("Fehler beim Speichern");
    }
  }

  function toggleExtra(key: string) {
    setExtrasState((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );
  }

  const formattedDate = new Date(order.eventDate).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const { firma, kontakt } = (() => {
    const sep = order.customerName.indexOf(" - ");
    return sep >= 0
      ? { firma: order.customerName.slice(0, sep), kontakt: order.customerName.slice(sep + 3) }
      : { firma: null, kontakt: order.customerName };
  })();

  const ort = order.locationAddress.match(/\d{5}\s+(.+)$/)?.[1] ?? "";

  const driver1 = drivers.find((d) => d.id === order.driverId);
  const driver2 = drivers.find((d) => d.id === order.secondDriverId);
  const driverDisplay = (() => {
    if (!driver1) return null;
    const d1 = `${driver1.name}${driver1.initials ? ` (${driver1.initials})` : ""}`;
    if (!driver2) return d1;
    return `${d1} / ${driver2.name}${driver2.initials ? ` (${driver2.initials})` : ""}`;
  })();

  const activeExtras = extrasState
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
    { label: "Bestätigt", icon: IconCircleCheck, done: statusState.confirmed },
    { label: "Design", icon: IconPalette, done: statusState.designReady },
    { label: "Geplant", icon: IconTruck, done: statusState.planned },
    { label: "Bezahlt", icon: IconCoin, done: statusState.paid },
  ];

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.locationName + ", " + order.locationAddress)}`;

  const hasSchedule = order.setupDate || order.setupTime || order.teardownDate || order.teardownTime;

  return (
    <div className="space-y-6">
      {/* ── Hero Header ── */}
      <div className="rounded-2xl border border-white/[0.10] bg-card shadow-lg shadow-black/30 p-4 sm:p-6">
        {/* Top row */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <Link
            href="/orders"
            className="flex items-center justify-center size-9 rounded-lg border border-white/[0.08] bg-[#1c1d20] text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
          >
            <IconArrowLeft className="size-4" />
          </Link>
          <span className="text-xs font-mono text-zinc-400">#{order.orderNumber}</span>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 px-3 py-1.5 text-sm font-medium">
                <IconSteeringWheel className="size-4" />
                {driverDisplay ?? <span className="italic opacity-50">–</span>}
              </span>
              <span className={
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium " +
                (order.paymentMethod === "CASH"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-purple-500/30 bg-purple-500/10 text-purple-400")
              }>
                <IconCash className="size-4" />
                {order.paymentMethod === "CASH" ? "Bar" : "Rechnung"}
              </span>
            </div>
            {/* Confirmation link */}
            {order.confirmationToken && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/confirm/${order.confirmationToken}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Bestätigungslink kopiert");
                }}
                className={
                  "flex items-center justify-center size-8 sm:h-8 sm:w-auto sm:px-3 rounded-lg border text-xs font-medium transition-colors " +
                  (order.confirmedByCustomerAt
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-white/[0.08] bg-[#1c1d20] text-zinc-300 hover:bg-[#222326]")
                }
              >
                {order.confirmedByCustomerAt ? <IconCircleCheckFilled className="size-3.5" /> : <IconLink className="size-3.5" />}
                <span className="hidden sm:inline sm:ml-1.5">{order.confirmedByCustomerAt ? "Bestätigt" : "Link kopieren"}</span>
              </button>
            )}
            {order.designToken && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/design/${order.designToken}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Design-Link kopiert");
                }}
                className={
                  "flex items-center gap-1.5 size-8 sm:h-8 sm:w-auto sm:px-3 justify-center rounded-lg border text-xs font-medium transition-colors " +
                  (order.designReady
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-purple-500/30 bg-purple-500/10 text-purple-400")
                }
              >
                <IconPalette className="size-3.5" />
                <span className="hidden sm:inline">{order.designReady ? "Design fertig" : "Design-Link"}</span>
              </button>
            )}
            <a
              href={`/api/orders/${order.id}/pdf`}
              target="_blank"
              className="flex items-center justify-center size-8 sm:h-8 sm:w-auto sm:px-3 rounded-lg border border-white/[0.08] bg-[#1c1d20] text-zinc-300 text-xs font-medium hover:bg-[#222326] transition-colors"
            >
              <IconFileDownload className="size-3.5" />
              <span className="hidden sm:inline sm:ml-1.5">PDF</span>
            </a>
            {isAdmin && (
              <button
                onClick={onEdit}
                className="flex items-center justify-center size-8 sm:h-8 sm:w-auto sm:px-3 rounded-lg border border-white/[0.08] bg-[#1c1d20] text-zinc-300 text-xs font-medium hover:bg-[#222326] transition-colors"
              >
                <IconEdit className="size-3.5" />
                <span className="hidden sm:inline sm:ml-1.5">Bearbeiten</span>
              </button>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <IconCalendar className="size-5 text-[#F6A11C] shrink-0" />
          <span className="text-base sm:text-xl text-[#F6A11C] font-semibold">{formattedDate}</span>
          <span className="inline-flex items-center rounded-md bg-[#222326] px-2.5 py-0.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
            {order.eventType}
          </span>
        </div>

        {/* Customer Name */}
        {firma ? (
          <div className="mb-1.5">
            <p className="text-sm sm:text-base text-zinc-400 mb-0.5">{firma}</p>
            <h1 className="text-xl sm:text-3xl font-bold text-zinc-100">{kontakt}</h1>
          </div>
        ) : (
          <h1 className="text-xl sm:text-3xl font-bold text-zinc-100 mb-1.5">{kontakt}</h1>
        )}

        {/* Location */}
        <div className="flex items-start gap-2 text-zinc-400">
          <IconMapPin className="size-4 shrink-0 mt-0.5" />
          <span className="text-sm sm:text-base">
            <span className="text-zinc-300 font-medium">{order.locationName}</span>
            {ort && <span className="text-muted-foreground"> &middot; {ort}</span>}
            {order.distanceKm != null && (
              <span className="text-zinc-400"> &middot; {order.distanceKm} km</span>
            )}
          </span>
        </div>
      </div>

      {/* Customer confirmation timestamp */}
      {order.confirmedByCustomerAt && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5">
          <IconCircleCheckFilled className="size-4 text-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-400 font-medium">Vom Kunden bestätigt</span>
          <span className="text-xs text-zinc-400 ml-auto">
            {new Date(order.confirmedByCustomerAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })} um {new Date(order.confirmedByCustomerAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
          </span>
        </div>
      )}

      {/* ── Content + Sidebar ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left: Main Content ── */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Status */}
          <div className="rounded-xl border border-white/[0.10] bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</h3>
              {isAdmin && !editingStatus && (
                <button onClick={() => setEditingStatus(true)} className="text-zinc-400 hover:text-zinc-300 transition-colors">
                  <IconPencil className="size-4.5" />
                </button>
              )}
              {editingStatus && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      saveField(statusState);
                      setEditingStatus(false);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <IconCheck className="size-5" />
                  </button>
                  <button
                    onClick={() => {
                      setStatusState({ confirmed: order.confirmed, designReady: order.designReady, planned: order.planned, paid: order.paid });
                      setEditingStatus(false);
                    }}
                    className="text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    <IconX className="size-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {([
                { key: "confirmed" as const, label: "Bestätigt", icon: IconCircleCheck },
                { key: "designReady" as const, label: "Design", icon: IconPalette },
                { key: "planned" as const, label: "Geplant", icon: IconTruck },
                { key: "paid" as const, label: "Bezahlt", icon: IconCoin },
              ]).map((s) => {
                const done = statusState[s.key];
                return editingStatus ? (
                  <button
                    key={s.label}
                    onClick={() => setStatusState((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                    className={
                      "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 min-w-[90px] cursor-pointer hover:opacity-80 transition-colors " +
                      (done
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-red-500/20 bg-red-500/5 text-red-400/60")
                    }
                  >
                    <s.icon className="size-8" />
                    <span className="text-[11px] font-bold uppercase tracking-wide">{s.label}</span>
                  </button>
                ) : (
                  <div
                    key={s.label}
                    className={
                      "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 min-w-[90px] " +
                      (done
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-red-500/20 bg-red-500/5 text-red-400/60")
                    }
                  >
                    <s.icon className="size-8" />
                    <span className="text-[11px] font-bold uppercase tracking-wide">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extras */}
          {(activeExtras.length > 0 || editingExtras) && (
            <div className="rounded-xl border border-white/[0.10] bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Extras</h3>
                {isAdmin && !editingExtras && (
                  <button onClick={() => setEditingExtras(true)} className="text-zinc-400 hover:text-zinc-300 transition-colors">
                    <IconPencil className="size-4.5" />
                  </button>
                )}
                {editingExtras && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        saveField({ extras: extrasState });
                        setEditingExtras(false);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <IconCheck className="size-5" />
                    </button>
                    <button
                      onClick={() => { setExtrasState(order.extras); setEditingExtras(false); }}
                      className="text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      <IconX className="size-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {editingExtras
                  ? EXTRAS_CONFIG.map((ext) => {
                      const active = extrasState.includes(ext.key);
                      return (
                        <button
                          key={ext.key}
                          onClick={() => toggleExtra(ext.key)}
                          className={
                            "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 min-w-[90px] cursor-pointer hover:opacity-80 transition-colors " +
                            (active
                              ? "border-[#F6A11C]/30 bg-[#F6A11C]/10 text-[#F6A11C]"
                              : "border-white/[0.10] bg-card text-zinc-400")
                          }
                        >
                          <ext.icon className="size-8" />
                          <span className="text-[11px] font-bold uppercase tracking-wide">{ext.label}</span>
                          {(EXTRAS_PRICES[ext.key] ?? 0) > 0 && (
                            <span className="text-[10px] font-mono opacity-60">{EXTRAS_PRICES[ext.key]}&euro;</span>
                          )}
                        </button>
                      );
                    })
                  : activeExtras.map((ext) => (
                      <div
                        key={ext.key}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#F6A11C]/30 bg-[#F6A11C]/10 p-4 min-w-[90px] text-[#F6A11C]"
                      >
                        <ext.icon className="size-8" />
                        <span className="text-[11px] font-bold uppercase tracking-wide">{ext.label}</span>
                        {ext.price > 0 && (
                          <span className="text-[10px] font-mono opacity-60">{ext.price}&euro;</span>
                        )}
                      </div>
                    ))}
              </div>
            </div>
          )}

          {/* Auftraggeber + Location + Lieferung */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Auftraggeber */}
            <div className="rounded-xl border border-white/[0.10] bg-card p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Auftraggeber</h3>
              <p className="text-base font-semibold text-zinc-100 mb-0.5">{kontakt}</p>
              {firma && (
                <p className="text-sm text-zinc-400 mb-3">{firma}</p>
              )}
              <div className="space-y-2.5 border-t border-white/[0.10] pt-3">
                {order.customerEmail && order.customerEmail !== "unbekannt@import.local" && (
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-14 shrink-0">E-Mail</span>
                    <a href={`mailto:${order.customerEmail}`} className="text-sm text-zinc-300 hover:text-[#F6A11C] transition-colors truncate">
                      {order.customerEmail}
                    </a>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-14 shrink-0">Telefon</span>
                    <a href={`tel:${order.customerPhone.replace(/[\s\/]/g, "")}`} className="text-sm text-zinc-300 hover:text-[#F6A11C] transition-colors">
                      {order.customerPhone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-14 shrink-0">Firma</span>
                  <span className="text-sm text-zinc-300">{order.companyName.includes("GbR") ? "GbR" : "Einzelunternehmen"}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl border border-white/[0.10] bg-card p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Location</h3>
              <Link
                href={order.locationId ? `/locations/${order.locationId}` : `/locations`}
                className="text-base font-medium text-zinc-200 hover:text-[#F6A11C] transition-colors inline-flex items-center gap-1.5"
              >
                {order.locationName}
                <IconExternalLink className="size-3.5 opacity-50" />
              </Link>
              <p className="text-sm text-zinc-200 mt-1">{order.locationAddress}</p>
              {order.distanceKm != null && (
                <div className="border-t border-white/[0.10] mt-3 pt-3">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Entfernung: </span>
                    <span className="text-zinc-200 font-mono tabular-nums">{order.distanceKm} km</span>
                  </p>
                </div>
              )}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-[#F6A11C] hover:underline"
              >
                <IconMapPin className="size-3" />
                In Google Maps anzeigen
              </a>
            </div>

            {/* Lieferung */}
            <div className="rounded-xl border border-white/[0.10] bg-card p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Lieferung</h3>
              {hasSchedule ? (
                <div className="space-y-4">
                  {(order.setupDate || order.setupTime) && (
                    <div className="flex items-center gap-3">
                      <IconClock className="size-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Aufbau</p>
                        <p className="text-base font-medium text-zinc-100">
                          {formatDateShort(order.setupDate)}
                          {order.setupTime && <><span className="text-muted-foreground mx-2">|</span><span className="font-mono">{order.setupTime}</span></>}
                        </p>
                      </div>
                    </div>
                  )}
                  {(order.teardownDate || order.teardownTime) && (
                    <div className="flex items-center gap-3">
                      <IconClock className="size-5 text-red-400 shrink-0" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Abbau</p>
                        <p className="text-base font-medium text-zinc-100">
                          {formatDateShort(order.teardownDate)}
                          {order.teardownTime && <><span className="text-muted-foreground mx-2">|</span><span className="font-mono">{order.teardownTime}</span></>}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Noch nicht geplant</p>
              )}
            </div>
          </div>

          {/* Notizen */}
          <div className="space-y-3">
            {/* Kundenkommentar */}
            {(order.notes || editingNotes || isAdmin) && (
              <div className="rounded-xl border border-white/[0.10] bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconMessageCircle className="size-4 text-muted-foreground" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kundenkommentar</h3>
                  </div>
                  {isAdmin && !editingNotes && (
                    <button onClick={() => setEditingNotes(true)} className="text-zinc-400 hover:text-zinc-300 transition-colors">
                      <IconPencil className="size-4.5" />
                    </button>
                  )}
                  {editingNotes && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => { saveField({ notes: notesState || null }); setEditingNotes(false); }} className="text-emerald-400 hover:text-emerald-300"><IconCheck className="size-4" /></button>
                      <button onClick={() => { setNotesState(order.notes ?? ""); setEditingNotes(false); }} className="text-zinc-400 hover:text-zinc-300"><IconX className="size-4" /></button>
                    </div>
                  )}
                </div>
                {editingNotes ? (
                  <textarea
                    value={notesState}
                    onChange={(e) => setNotesState(e.target.value)}
                    className="w-full h-24 rounded-lg border border-white/[0.08] bg-[#1c1d20] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 resize-none"
                    placeholder="Kommentar..."
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{order.notes || <span className="text-muted-foreground italic">Kein Kommentar</span>}</p>
                )}
              </div>
            )}

            {/* Intern */}
            {showInternal && (order.internalNotes || editingInternal || isAdmin) && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconAlertCircle className="size-4 text-amber-400" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Intern</h3>
                  </div>
                  {isAdmin && !editingInternal && (
                    <button onClick={() => setEditingInternal(true)} className="text-zinc-400 hover:text-zinc-300 transition-colors">
                      <IconPencil className="size-4.5" />
                    </button>
                  )}
                  {editingInternal && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => { saveField({ internalNotes: internalState || null }); setEditingInternal(false); }} className="text-emerald-400 hover:text-emerald-300"><IconCheck className="size-4" /></button>
                      <button onClick={() => { setInternalState(order.internalNotes ?? ""); setEditingInternal(false); }} className="text-zinc-400 hover:text-zinc-300"><IconX className="size-4" /></button>
                    </div>
                  )}
                </div>
                {editingInternal ? (
                  <textarea
                    value={internalState}
                    onChange={(e) => setInternalState(e.target.value)}
                    className="w-full h-24 rounded-lg border border-amber-500/20 bg-black/20 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 resize-none"
                    placeholder="Interner Kommentar..."
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-zinc-400 whitespace-pre-wrap">{order.internalNotes || <span className="text-muted-foreground italic">Kein interner Kommentar</span>}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Drucklayouts - volle Breite */}
          <div className="rounded-xl border border-white/[0.10] bg-card p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Drucklayouts</h3>
            <ImageGallery orderId={order.id} images={order.images} isAdmin={isAdmin} singleColumn />
          </div>

          {/* Kundenpreis */}
          <div className="rounded-xl border border-white/[0.10] bg-card p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Preiskalkulation</h3>
            <div className="space-y-1">
              {order.boxPrice != null && <PriceRow label="Fotobox" value={order.boxPrice} />}
              {order.travelCost != null && <PriceRow label="Fahrtkosten" value={order.travelCost} />}
              {activeExtras.filter(e => e.price > 0).map((e) => (
                <PriceRow key={e.key} label={e.label} value={e.price} />
              ))}
              {discountAmount > 0 && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-sm text-red-400">
                    Rabatt {order.discountType === "PERCENT" && order.discount ? `(${order.discount}%)` : ""}
                  </span>
                  <span className="text-sm font-mono tabular-nums text-red-400">
                    &minus;{discountAmount.toFixed(2)}&euro;
                  </span>
                </div>
              )}
              <div className="border-t border-white/[0.10] mt-2 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-200">Gesamt</span>
                <span className="text-lg font-bold font-mono tabular-nums text-[#F6A11C]">
                  {customerTotal.toFixed(2)}&euro;
                </span>
              </div>
            </div>
          </div>

          {/* Intern */}
          {showInternal && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-3">Intern</h3>
              <div className="space-y-1">
                <PriceRow label="Kundenpreis" value={customerTotal} />
                {order.setupCost != null && (
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-sm text-zinc-400">Aufbau</span>
                    <span className="text-sm font-mono tabular-nums text-red-400">
                      {Math.abs(order.setupCost).toFixed(2)}&euro;
                    </span>
                  </div>
                )}
                {order.materialCost != null && (
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-sm text-zinc-400">Material</span>
                    <span className="text-sm font-mono tabular-nums text-red-400">
                      {Math.abs(order.materialCost).toFixed(2)}&euro;
                    </span>
                  </div>
                )}
                <div className="border-t border-amber-500/20 mt-2 pt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200">Gewinn</span>
                  <span className={"text-lg font-bold font-mono tabular-nums " + (internalProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {internalProfit.toFixed(2)}&euro;
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
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
