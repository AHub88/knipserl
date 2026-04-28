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
  IconFlag,
  IconStar,
  IconUser,
  IconCurrencyEuro,
  IconLayout,
  IconReceipt,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { EXTRAS_PRICES, PAPER_ROLL_PRICE } from "@/lib/extras-pricing";
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
  startscreenImages: string[];
  onSiteContactName: string | null;
  onSiteContactPhone: string | null;
  onSiteContactNotes: string | null;
  extraPaperRolls: number;
  createdAt?: string;
  updatedAt?: string;
  graphicUrl?: string | null;
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

function formatDateDDMMYY(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}


export function OrderViewA({ order, drivers, isAdmin, viewMode, onEdit }: Props) {
  const router = useRouter();

  // Inline edit states
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingExtras, setEditingExtras] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingInternal, setEditingInternal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [editingOnSite, setEditingOnSite] = useState(false);

  const [statusState, setStatusState] = useState({
    confirmed: order.confirmed,
    designReady: order.designReady,
    planned: order.planned,
    paid: order.paid,
  });
  const [extrasState, setExtrasState] = useState<string[]>(order.extras);
  const [notesState, setNotesState] = useState(order.notes ?? "");
  const [internalState, setInternalState] = useState(order.internalNotes ?? "");
  const [driverIdState, setDriverIdState] = useState(order.driverId ?? "");
  const [secondDriverIdState, setSecondDriverIdState] = useState(order.secondDriverId ?? "");
  const [extraPaperRollsState, setExtraPaperRollsState] = useState(String(order.extraPaperRolls ?? 0));
  const [setupDateState, setSetupDateState] = useState(order.setupDate ? order.setupDate.slice(0, 10) : "");
  const [setupTimeState, setSetupTimeState] = useState(order.setupTime ?? "");
  const [teardownDateState, setTeardownDateState] = useState(order.teardownDate ? order.teardownDate.slice(0, 10) : "");
  const [teardownTimeState, setTeardownTimeState] = useState(order.teardownTime ?? "");
  const [customerNameState, setCustomerNameState] = useState(order.customerName);
  const [customerEmailState, setCustomerEmailState] = useState(order.customerEmail);
  const [customerPhoneState, setCustomerPhoneState] = useState(order.customerPhone ?? "");
  const [onSiteNameState, setOnSiteNameState] = useState(order.onSiteContactName ?? "");
  const [onSitePhoneState, setOnSitePhoneState] = useState(order.onSiteContactPhone ?? "");
  const [onSiteNotesState, setOnSiteNotesState] = useState(order.onSiteContactNotes ?? "");
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);

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
    // 1 Fahrer: voller Name mit Initialen
    if (!driver2) {
      return `${driver1.name}${driver1.initials ? ` (${driver1.initials})` : ""}`;
    }
    // 2 Fahrer: nur Initialen (Fallback auf Name falls keine Initialen gepflegt sind)
    return `${driver1.initials ?? driver1.name} / ${driver2.initials ?? driver2.name}`;
  })();

  const activeExtras = extrasState
    .map((key) => {
      const cfg = EXTRAS_CONFIG.find((e) => e.key === key);
      return cfg ? { ...cfg, price: EXTRAS_PRICES[key] ?? 0 } : null;
    })
    .filter(Boolean) as { key: string; label: string; icon: typeof IconPrinter; price: number }[];

  const paperRollsCost = (order.extraPaperRolls ?? 0) * PAPER_ROLL_PRICE;
  const customerSubtotal = (order.boxPrice ?? 0) + (order.travelCost ?? 0) + (order.extrasCost ?? 0) + paperRollsCost;
  const discountAmount = order.discount
    ? order.discountType === "PERCENT" ? (customerSubtotal * order.discount) / 100 : order.discount
    : 0;
  const customerTotal = customerSubtotal - discountAmount;
  const internalProfit = customerTotal - Math.abs(order.setupCost ?? 0) - Math.abs(order.materialCost ?? 0);
  const isDriverView = viewMode === "driver";
  // Interne Box (Preiskalkulation + Interner Kommentar) sichtbar außer in der Buchhaltungs-Ansicht.
  // Fahrer dürfen intern sehen (und den Kommentar bearbeiten).
  const showInternal = viewMode !== "accounting";
  const canEditInternalNotes = isAdmin || isDriverView;

  const statusFlags = [
    { label: "Bestätigt", icon: IconCircleCheck, done: statusState.confirmed },
    { label: "Design", icon: IconPalette, done: statusState.designReady },
    { label: "Geplant", icon: IconTruck, done: statusState.planned },
    { label: "Bezahlt", icon: IconCoin, done: statusState.paid },
  ];

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.locationName + ", " + order.locationAddress)}`;

  const hasSchedule = order.setupDate || order.setupTime || order.teardownDate || order.teardownTime;

  const eventInPast = new Date(order.eventDate) < new Date();
  const companyTag = order.companyName.includes("GbR") ? "GbR" : "EU";
  const paymentLabel = order.paymentMethod === "CASH" ? "Bar" : "Rechnung";
  const doneSteps = [statusState.confirmed, statusState.designReady, statusState.planned, statusState.paid].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* ── Hero Header mit Action-Rail ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left: Info-Block */}
          <div className="flex-1 min-w-0 p-4 sm:p-6">
            {/* Topline: back + meta */}
            <div className="flex items-center gap-2 mb-5 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (typeof window === "undefined") return;
                  const sameOriginReferrer =
                    document.referrer &&
                    document.referrer.startsWith(window.location.origin);
                  if (sameOriginReferrer && window.history.length > 1) {
                    router.back();
                  } else {
                    router.push("/orders");
                  }
                }}
                aria-label="Zurück"
                className="flex items-center justify-center size-8 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <IconArrowLeft className="size-4" />
              </button>
              <div className="flex items-center gap-2 text-muted-foreground flex-wrap min-w-0">
                <span className="font-mono">#{order.orderNumber}</span>
                <span className="size-1 rounded-full bg-muted-foreground/40 shrink-0" />
                <span>{companyTag}</span>
                <span className="size-1 rounded-full bg-muted-foreground/40 shrink-0" />
                <span>{paymentLabel}</span>
              </div>
            </div>

            {/* Event type (über Datum) */}
            <div className="mb-1.5">
              <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {order.eventType}
              </span>
            </div>

            {/* Date banner */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <IconCalendar className="size-5 text-primary shrink-0" />
              <span className="text-base sm:text-xl text-primary font-semibold">{formattedDate}</span>
            </div>

            {/* Customer Name - Desktop: Firma – Name inline / Mobile: untereinander */}
            <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-2">
              {firma ? (
                <>
                  <span className="block sm:inline text-muted-foreground font-semibold">{firma}</span>
                  <span className="hidden sm:inline text-muted-foreground mx-2 font-normal">&ndash;</span>
                  <span className="block sm:inline">{kontakt}</span>
                </>
              ) : (
                kontakt
              )}
            </h1>

            {/* Location */}
            <div className="flex items-center gap-2 text-muted-foreground text-sm flex-wrap">
              <IconMapPin className="size-4 shrink-0" />
              <span className="text-foreground/80 font-medium">{order.locationName}</span>
              {ort && <span>&middot; {ort}</span>}
              {order.distanceKm != null && <span>&middot; {order.distanceKm} km</span>}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:underline inline-flex items-center gap-0.5"
              >
                <IconExternalLink className="size-3" />
                Maps
              </a>
            </div>

            {/* Meta: Gebucht + Geändert als Pillen */}
            {(order.createdAt || order.updatedAt) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {order.createdAt && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">Gebucht</span>
                    <span className="text-foreground/80 tabular-nums">{formatDateDDMMYY(order.createdAt)}</span>
                  </span>
                )}
                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">Geändert</span>
                    <span className="text-foreground/80 tabular-nums">{formatDateDDMMYY(order.updatedAt)}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Fahrer-Ansicht: Fahrer-Name + Workflow-Status (read-only), keine Action-Rail */}
          {isDriverView ? (
            <div className="w-full lg:w-64 lg:border-l border-t lg:border-t-0 border-border bg-muted/20 p-4 flex flex-col gap-2">
              {/* Fahrer-Header */}
              <div className="pb-3 mb-1 border-b border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Fahrer</p>
                <div className="flex items-center gap-2 h-5">
                  <IconSteeringWheel
                    className={
                      "size-4 shrink-0 " + (driverDisplay ? "text-primary" : "text-muted-foreground")
                    }
                  />
                  {driverDisplay ? (
                    <span className="text-sm font-semibold text-foreground truncate">{driverDisplay}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Nicht zugewiesen</span>
                  )}
                </div>
              </div>

              {/* Status-Pills (read-only für Fahrer) */}
              {([
                { key: "confirmed" as const, label: "Bestätigt", icon: IconCircleCheck, warnIfPast: false },
                { key: "designReady" as const, label: "Design", icon: IconPalette, warnIfPast: false },
                { key: "planned" as const, label: "Geplant", icon: IconTruck, warnIfPast: false },
                { key: "paid" as const, label: "Bezahlt", icon: IconCoin, warnIfPast: true },
              ]).map((s) => {
                const done = statusState[s.key];
                const warn = !done && s.warnIfPast && eventInPast;
                return (
                  <div
                    key={s.label}
                    className={
                      "flex items-center gap-2 h-9 px-3 rounded-lg border text-xs font-medium " +
                      (done
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : warn
                          ? "border-red-500/30 bg-red-500/10 text-red-400"
                          : "border-border bg-card text-muted-foreground")
                    }
                  >
                    <s.icon className="size-4 shrink-0" />
                    <span>{s.label}</span>
                    {done && <IconCheck className="size-3.5 opacity-70 ml-auto" />}
                  </div>
                );
              })}
            </div>
          ) : (
          <>
          {/* Middle: Workflow */}
          <div className="w-full lg:w-64 lg:border-l border-t lg:border-t-0 border-border bg-muted/20 p-4 flex flex-col gap-2">
            {/* Header block — matches Fahrer block in rail */}
            <div className="pb-3 mb-1 border-b border-border">
              <div className="flex items-center justify-between h-5">
                <div className="flex items-center gap-2">
                  <IconFlag className="size-4 text-primary shrink-0" />
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workflow</h3>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {doneSteps}/4
                  </span>
                </div>
                {isAdmin && !editingStatus && (
                  <button onClick={() => setEditingStatus(true)} className="text-muted-foreground hover:text-foreground/80 transition-colors">
                    <IconPencil className="size-4" />
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
                      className="text-muted-foreground hover:text-foreground/80 transition-colors"
                    >
                      <IconX className="size-5" />
                    </button>
                  </div>
                )}
              </div>
              {/* Progress bar — centered in h-5 row to match Fahrer name row height */}
              <div className="mt-1.5 h-5 flex items-center">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all"
                    style={{ width: `${(doneSteps / 4) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Status pills - stacked */}
            {([
              { key: "confirmed" as const, label: "Bestätigt", icon: IconCircleCheck, warnIfPast: false },
              { key: "designReady" as const, label: "Design", icon: IconPalette, warnIfPast: false },
              { key: "planned" as const, label: "Geplant", icon: IconTruck, warnIfPast: false },
              { key: "paid" as const, label: "Bezahlt", icon: IconCoin, warnIfPast: true },
            ]).map((s) => {
              const done = statusState[s.key];
              const warn = !done && s.warnIfPast && eventInPast;
              const baseClass =
                "flex items-center gap-2 h-9 px-3 rounded-lg border text-xs font-medium transition-colors " +
                (done
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : warn
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-border bg-card text-muted-foreground");
              return editingStatus ? (
                <button
                  key={s.label}
                  onClick={() => setStatusState((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                  className={baseClass + " cursor-pointer hover:opacity-80"}
                >
                  <s.icon className="size-4 shrink-0" />
                  <span>{s.label}</span>
                  {done && <IconCheck className="size-3.5 opacity-70 ml-auto" />}
                </button>
              ) : (
                <div key={s.label} className={baseClass}>
                  <s.icon className="size-4 shrink-0" />
                  <span>{s.label}</span>
                  {done && <IconCheck className="size-3.5 opacity-70 ml-auto" />}
                </div>
              );
            })}
          </div>

          {/* Right: Action Rail */}
          <div className="w-full lg:w-64 lg:border-l border-t lg:border-t-0 border-border bg-muted/30 p-4 flex flex-col gap-2">
            {/* Fahrer — inline editable */}
            <div className="pb-3 mb-1 border-b border-border">
              <div className="flex items-center justify-between h-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fahrer</p>
                {isAdmin && !editingDriver && (
                  <button onClick={() => setEditingDriver(true)} className="text-muted-foreground hover:text-foreground/80 transition-colors">
                    <IconPencil className="size-4" />
                  </button>
                )}
                {editingDriver && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        await saveField({
                          driverId: driverIdState || null,
                          secondDriverId: secondDriverIdState || null,
                        });
                        setEditingDriver(false);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <IconCheck className="size-5" />
                    </button>
                    <button
                      onClick={() => {
                        setDriverIdState(order.driverId ?? "");
                        setSecondDriverIdState(order.secondDriverId ?? "");
                        setEditingDriver(false);
                      }}
                      className="text-muted-foreground hover:text-foreground/80 transition-colors"
                    >
                      <IconX className="size-5" />
                    </button>
                  </div>
                )}
              </div>
              {!editingDriver ? (
                <div className="mt-1.5 h-5 flex items-center gap-1.5">
                  <IconSteeringWheel
                    className={
                      "size-4 shrink-0 " + (driverDisplay ? "text-primary" : "text-muted-foreground")
                    }
                  />
                  {driverDisplay ? (
                    <span className="text-sm font-semibold text-foreground truncate">{driverDisplay}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Nicht zugewiesen</span>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await saveField({
                      driverId: driverIdState || null,
                      secondDriverId: secondDriverIdState || null,
                    });
                    setEditingDriver(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setDriverIdState(order.driverId ?? "");
                      setSecondDriverIdState(order.secondDriverId ?? "");
                      setEditingDriver(false);
                    }
                  }}
                  className="mt-1.5 space-y-1.5"
                >
                  <select
                    value={driverIdState}
                    onChange={(e) => setDriverIdState(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                      }
                    }}
                    className="h-8 w-full rounded-md border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="">– Kein Fahrer –</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                        {d.initials ? ` (${d.initials})` : ""}
                      </option>
                    ))}
                  </select>
                  <select
                    value={secondDriverIdState}
                    onChange={(e) => setSecondDriverIdState(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                      }
                    }}
                    className="h-8 w-full rounded-md border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="">– Kein 2. Fahrer –</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                        {d.initials ? ` (${d.initials})` : ""}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
                </form>
              )}
            </div>

            {/* Actions */}
            {order.confirmationToken && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/confirm/${order.confirmationToken}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Bestätigungslink kopiert");
                }}
                className={
                  "flex items-center gap-2 h-9 px-3 rounded-lg border text-xs font-medium transition-colors " +
                  (order.confirmedByCustomerAt
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
                    : "border-border bg-card text-foreground/80 hover:bg-accent")
                }
              >
                {order.confirmedByCustomerAt ? <IconCircleCheckFilled className="size-4 shrink-0" /> : <IconLink className="size-4 shrink-0" />}
                <span>Bestätigungslink</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={async () => {
                  if (order.designToken) {
                    const url = `${window.location.origin}/design/${order.designToken}`;
                    await navigator.clipboard.writeText(url);
                    toast.success("Design-Link kopiert");
                  } else {
                    try {
                      const res = await fetch(`/api/orders/${order.id}/design`, { method: "POST" });
                      if (!res.ok) throw new Error();
                      const { token } = await res.json();
                      const url = `${window.location.origin}/design/${token}`;
                      await navigator.clipboard.writeText(url);
                      toast.success("Design erstellt & Link kopiert");
                      router.refresh();
                    } catch {
                      toast.error("Design konnte nicht erstellt werden");
                    }
                  }
                }}
                className={
                  "flex items-center gap-2 h-9 px-3 rounded-lg border text-xs font-medium transition-colors " +
                  (order.designToken
                    ? "border-border bg-card text-foreground/80 hover:bg-accent"
                    : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15")
                }
              >
                <IconPalette className="size-4 shrink-0" />
                <span>{order.designToken ? "Design-Link" : "Design erstellen"}</span>
              </button>
            )}
            <a
              href={`/api/orders/${order.id}/pdf`}
              target="_blank"
              className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-card text-foreground/80 text-xs font-medium hover:bg-accent transition-colors"
            >
              <IconFileDownload className="size-4 shrink-0" />
              <span>PDF</span>
            </a>
            {isAdmin && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-card text-foreground/80 text-xs font-medium hover:bg-accent transition-colors"
              >
                <IconEdit className="size-4 shrink-0" />
                <span>Bearbeiten</span>
              </button>
            )}
          </div>
          </>
          )}
        </div>
      </div>

      {/* Zahlart-Banner (Fahrer-Ansicht): Bar oder Rechnung prominent */}
      {isDriverView && (
        <div
          className={
            "flex items-center gap-3 rounded-xl border px-5 py-3 " +
            (order.paymentMethod === "CASH"
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
              : "border-sky-500/40 bg-sky-500/15 text-sky-400")
          }
        >
          <IconCash className="size-7 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Zahlart</p>
            <p className="text-xl font-bold uppercase tracking-wide">
              {order.paymentMethod === "CASH" ? "Bar kassieren" : "Rechnung — nicht kassieren"}
            </p>
          </div>
        </div>
      )}

      {/* Customer confirmation timestamp */}
      {order.confirmedByCustomerAt && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5">
          <IconCircleCheckFilled className="size-4 text-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-400 font-medium">Vom Kunden bestätigt</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(order.confirmedByCustomerAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })} um {new Date(order.confirmedByCustomerAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
          </span>
        </div>
      )}

      {/* ── Content + Sidebar ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left: Main Content ── */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Extras */}
          {(activeExtras.length > 0 || editingExtras || order.extraPaperRolls > 0) && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <IconStar className="size-4 text-primary" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Extras</h3>
                </div>
                {isAdmin && !editingExtras && (
                  <button onClick={() => setEditingExtras(true)} className="text-muted-foreground hover:text-foreground/80 transition-colors">
                    <IconPencil className="size-4.5" />
                  </button>
                )}
                {editingExtras && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const rolls = extraPaperRollsState !== "" ? Math.max(0, Math.floor(Number(extraPaperRollsState) || 0)) : 0;
                        saveField({ extras: extrasState, extraPaperRolls: rolls });
                        setEditingExtras(false);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <IconCheck className="size-5" />
                    </button>
                    <button
                      onClick={() => {
                        setExtrasState(order.extras);
                        setExtraPaperRollsState(String(order.extraPaperRolls ?? 0));
                        setEditingExtras(false);
                      }}
                      className="text-muted-foreground hover:text-foreground/80 transition-colors"
                    >
                      <IconX className="size-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5">
              <div className="flex flex-wrap gap-3">
                {editingExtras
                  ? EXTRAS_CONFIG.map((ext) => {
                      const active = extrasState.includes(ext.key);
                      return (
                        <button
                          key={ext.key}
                          onClick={() => toggleExtra(ext.key)}
                          className={
                            "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 min-w-[88px] cursor-pointer hover:opacity-80 transition-colors " +
                            (active
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground")
                          }
                        >
                          <ext.icon className="size-7" />
                          <span className="text-[11px] font-bold uppercase tracking-wide">{ext.label}</span>
                          {(EXTRAS_PRICES[ext.key] ?? 0) > 0 && (
                            <span className="text-xs font-mono font-semibold text-foreground/80">{EXTRAS_PRICES[ext.key]}&nbsp;&euro;</span>
                          )}
                        </button>
                      );
                    })
                  : activeExtras.map((ext) => (
                      <div
                        key={ext.key}
                        className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 p-3 min-w-[88px] text-primary"
                      >
                        <ext.icon className="size-7" />
                        <span className="text-[11px] font-bold uppercase tracking-wide">{ext.label}</span>
                        {ext.price > 0 && (
                          <span className="text-xs font-mono font-semibold text-foreground/80">{ext.price}&nbsp;&euro;</span>
                        )}
                      </div>
                    ))}

                {/* Papierrollen: inline editierbar im Edit-Mode, sonst als Chip wenn > 0 */}
                {editingExtras ? (
                  <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card p-3 min-w-[88px] text-muted-foreground">
                    <IconReceipt className="size-7" />
                    <span className="text-[11px] font-bold uppercase tracking-wide">Papierrollen</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={extraPaperRollsState}
                      onChange={(e) => setExtraPaperRollsState(e.target.value)}
                      onClick={(e) => e.currentTarget.select()}
                      className="h-6 w-14 rounded-md border border-border bg-muted px-1 text-xs font-mono font-semibold text-center text-foreground outline-none focus:border-primary/50"
                    />
                  </div>
                ) : (
                  order.extraPaperRolls > 0 && (
                    <div
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 p-3 min-w-[88px] text-primary"
                      title={`${order.extraPaperRolls} zusätzliche Papierrolle${order.extraPaperRolls > 1 ? "n" : ""}`}
                    >
                      <IconReceipt className="size-7" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">Papierrolle{order.extraPaperRolls > 1 ? "n" : ""}</span>
                      <span className="text-xs font-mono font-semibold text-foreground/80">&times;&nbsp;{order.extraPaperRolls}</span>
                    </div>
                  )
                )}
              </div>
              </div>
            </div>
          )}

          {/* Auftraggeber + Ansprechpartner vor Ort + Location + Lieferung (2×2 Grid) */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Auftraggeber */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <IconUser className="size-4 text-primary" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Auftraggeber</h3>
                </div>
                {isAdmin && !editingCustomer && (
                  <button onClick={() => setEditingCustomer(true)} className="text-muted-foreground hover:text-foreground/80 transition-colors">
                    <IconPencil className="size-4.5" />
                  </button>
                )}
                {editingCustomer && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        await saveField({
                          customerName: customerNameState,
                          customerEmail: customerEmailState,
                          customerPhone: customerPhoneState || null,
                        });
                        setEditingCustomer(false);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <IconCheck className="size-5" />
                    </button>
                    <button
                      onClick={() => {
                        setCustomerNameState(order.customerName);
                        setCustomerEmailState(order.customerEmail);
                        setCustomerPhoneState(order.customerPhone ?? "");
                        setEditingCustomer(false);
                      }}
                      className="text-muted-foreground hover:text-foreground/80 transition-colors"
                    >
                      <IconX className="size-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5">
              {editingCustomer ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await saveField({
                      customerName: customerNameState,
                      customerEmail: customerEmailState,
                      customerPhone: customerPhoneState || null,
                    });
                    setEditingCustomer(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setCustomerNameState(order.customerName);
                      setCustomerEmailState(order.customerEmail);
                      setCustomerPhoneState(order.customerPhone ?? "");
                      setEditingCustomer(false);
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Name</p>
                    <input
                      type="text"
                      value={customerNameState}
                      onChange={(e) => setCustomerNameState(e.target.value)}
                      placeholder="Firma - Kontakt"
                      className="h-9 w-full rounded-md border border-border bg-muted px-2 text-sm text-foreground outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">E-Mail</p>
                    <input
                      type="email"
                      value={customerEmailState}
                      onChange={(e) => setCustomerEmailState(e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-muted px-2 text-sm text-foreground outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Telefon</p>
                    <input
                      type="tel"
                      value={customerPhoneState}
                      onChange={(e) => setCustomerPhoneState(e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-muted px-2 text-sm text-foreground outline-none focus:border-primary/50"
                    />
                  </div>
                  <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
                </form>
              ) : (
                <>
                  <p className="text-base font-semibold text-foreground mb-0.5">{kontakt}</p>
                  {firma && (
                    <p className="text-sm text-muted-foreground mb-3">{firma}</p>
                  )}
                  <div className="space-y-2.5 border-t border-border pt-3">
                    {order.customerEmail && order.customerEmail !== "unbekannt@import.local" && (
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-14 shrink-0">E-Mail</span>
                        <a href={`mailto:${order.customerEmail}`} className="text-sm text-foreground/80 hover:text-primary transition-colors truncate">
                          {order.customerEmail}
                        </a>
                      </div>
                    )}
                    {order.customerPhone && (
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-14 shrink-0">Telefon</span>
                        <a href={`tel:${order.customerPhone.replace(/[\s\/]/g, "")}`} className="text-sm text-foreground/80 hover:text-primary transition-colors">
                          {order.customerPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}
              </div>
            </div>

            {/* Ansprechpartner vor Ort */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <IconUser className="size-4 text-primary" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ansprechpartner vor Ort</h3>
                </div>
                {isAdmin && !editingOnSite && (
                  <button onClick={() => setEditingOnSite(true)} className="text-muted-foreground hover:text-foreground/80 transition-colors">
                    <IconPencil className="size-4.5" />
                  </button>
                )}
                {editingOnSite && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        await saveField({
                          onSiteContactName: onSiteNameState || null,
                          onSiteContactPhone: onSitePhoneState || null,
                          onSiteContactNotes: onSiteNotesState || null,
                        });
                        setEditingOnSite(false);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <IconCheck className="size-5" />
                    </button>
                    <button
                      onClick={() => {
                        setOnSiteNameState(order.onSiteContactName ?? "");
                        setOnSitePhoneState(order.onSiteContactPhone ?? "");
                        setOnSiteNotesState(order.onSiteContactNotes ?? "");
                        setEditingOnSite(false);
                      }}
                      className="text-muted-foreground hover:text-foreground/80 transition-colors"
                    >
                      <IconX className="size-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5">
              {editingOnSite ? (
                (() => {
                  // Auftraggeber-Kontakt (nur Personenname, ohne "Firma - ") für die "= Auftraggeber"-Checkbox
                  const customerContactName = (() => {
                    const sep = order.customerName.indexOf(" - ");
                    return sep >= 0 ? order.customerName.slice(sep + 3) : order.customerName;
                  })();
                  const sameAsCustomer =
                    onSiteNameState === customerContactName &&
                    onSitePhoneState === (order.customerPhone ?? "");
                  return (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await saveField({
                          onSiteContactName: onSiteNameState || null,
                          onSiteContactPhone: onSitePhoneState || null,
                          onSiteContactNotes: onSiteNotesState || null,
                        });
                        setEditingOnSite(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          e.preventDefault();
                          setOnSiteNameState(order.onSiteContactName ?? "");
                          setOnSitePhoneState(order.onSiteContactPhone ?? "");
                          setOnSiteNotesState(order.onSiteContactNotes ?? "");
                          setEditingOnSite(false);
                        }
                      }}
                      className="space-y-3"
                    >
                      <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                        <input
                          type="checkbox"
                          checked={sameAsCustomer}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setOnSiteNameState(customerContactName);
                              setOnSitePhoneState(order.customerPhone ?? "");
                            } else {
                              setOnSiteNameState("");
                              setOnSitePhoneState("");
                            }
                          }}
                          className="size-4 rounded border-border bg-muted accent-primary cursor-pointer"
                        />
                        <span className="text-foreground/80">= Auftraggeber</span>
                      </label>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Name</p>
                        <input
                          type="text"
                          value={onSiteNameState}
                          onChange={(e) => setOnSiteNameState(e.target.value)}
                          className="h-9 w-full rounded-md border border-border bg-muted px-2 text-sm text-foreground outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Telefon</p>
                        <input
                          type="tel"
                          value={onSitePhoneState}
                          onChange={(e) => setOnSitePhoneState(e.target.value)}
                          className="h-9 w-full rounded-md border border-border bg-muted px-2 text-sm text-foreground outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Notiz</p>
                        <textarea
                          value={onSiteNotesState}
                          onChange={(e) => setOnSiteNotesState(e.target.value)}
                          placeholder="Besonderheiten (Einfahrt, Etage, Schlüsselhinterlegung …)"
                          className="w-full h-20 rounded-md border border-border bg-muted px-2 py-2 text-sm text-foreground outline-none focus:border-primary/50 resize-none"
                        />
                      </div>
                      <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
                    </form>
                  );
                })()
              ) : order.onSiteContactName || order.onSiteContactPhone || order.onSiteContactNotes ? (
                <>
                  {order.onSiteContactName && (
                    <p className="text-base font-semibold text-foreground mb-3">{order.onSiteContactName}</p>
                  )}
                  <div className={"space-y-2.5 " + (order.onSiteContactName ? "border-t border-border pt-3" : "")}>
                    {order.onSiteContactPhone && (
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-14 shrink-0">Telefon</span>
                        <a href={`tel:${order.onSiteContactPhone.replace(/[\s\/]/g, "")}`} className="text-sm text-foreground/80 hover:text-primary transition-colors">
                          {order.onSiteContactPhone}
                        </a>
                      </div>
                    )}
                    {order.onSiteContactNotes && (
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{order.onSiteContactNotes}</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">Nicht erfasst</p>
              )}
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-5 py-3 flex items-center gap-2">
                <IconMapPin className="size-4 text-primary" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Location</h3>
              </div>
              <div className="p-5">
              <Link
                href={order.locationId ? `/locations/${order.locationId}` : `/locations`}
                className="text-base font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                {order.locationName}
                <IconExternalLink className="size-3.5 opacity-50" />
              </Link>
              <p className="text-sm text-foreground mt-1">{order.locationAddress}</p>
              {order.distanceKm != null && (
                <div className="border-t border-border mt-3 pt-3">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Entfernung: </span>
                    <span className="text-foreground font-mono tabular-nums">{order.distanceKm} km</span>
                  </p>
                </div>
              )}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
              >
                <IconMapPin className="size-3" />
                In Google Maps anzeigen
              </a>
              </div>
            </div>

            {/* Lieferung */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <IconTruck className="size-4 text-primary" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Lieferung</h3>
                </div>
                {isAdmin && !editingDelivery && (
                  <button onClick={() => setEditingDelivery(true)} className="text-muted-foreground hover:text-foreground/80 transition-colors">
                    <IconPencil className="size-4.5" />
                  </button>
                )}
                {editingDelivery && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        await saveField({
                          setupDate: setupDateState || null,
                          setupTime: setupTimeState || null,
                          teardownDate: teardownDateState || null,
                          teardownTime: teardownTimeState || null,
                        });
                        setEditingDelivery(false);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <IconCheck className="size-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSetupDateState(order.setupDate ? order.setupDate.slice(0, 10) : "");
                        setSetupTimeState(order.setupTime ?? "");
                        setTeardownDateState(order.teardownDate ? order.teardownDate.slice(0, 10) : "");
                        setTeardownTimeState(order.teardownTime ?? "");
                        setEditingDelivery(false);
                      }}
                      className="text-muted-foreground hover:text-foreground/80 transition-colors"
                    >
                      <IconX className="size-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5">
              {editingDelivery ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await saveField({
                      setupDate: setupDateState || null,
                      setupTime: setupTimeState || null,
                      teardownDate: teardownDateState || null,
                      teardownTime: teardownTimeState || null,
                    });
                    setEditingDelivery(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setSetupDateState(order.setupDate ? order.setupDate.slice(0, 10) : "");
                      setSetupTimeState(order.setupTime ?? "");
                      setTeardownDateState(order.teardownDate ? order.teardownDate.slice(0, 10) : "");
                      setTeardownTimeState(order.teardownTime ?? "");
                      setEditingDelivery(false);
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">Aufbau</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={setupDateState}
                        onChange={(e) => setSetupDateState(e.target.value)}
                        className="h-9 rounded-md border border-border bg-muted px-2 text-sm text-foreground outline-none focus:border-primary/50"
                      />
                      <input
                        type="text"
                        value={setupTimeState}
                        onChange={(e) => setSetupTimeState(e.target.value)}
                        placeholder="z. B. 14:30 / Vormittags"
                        className="h-9 rounded-md border border-border bg-muted px-2 text-sm text-foreground outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400 mb-1.5">Abbau</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={teardownDateState}
                        onChange={(e) => setTeardownDateState(e.target.value)}
                        className="h-9 rounded-md border border-border bg-muted px-2 text-sm text-foreground outline-none focus:border-primary/50"
                      />
                      <input
                        type="text"
                        value={teardownTimeState}
                        onChange={(e) => setTeardownTimeState(e.target.value)}
                        placeholder="z. B. 18:00 / vor Ort klären"
                        className="h-9 rounded-md border border-border bg-muted px-2 text-sm text-foreground outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                  {/* Hidden submit trigger so Enter on any input submits the form */}
                  <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
                </form>
              ) : hasSchedule ? (
                <div className="space-y-4">
                  {(order.setupDate || order.setupTime) && (
                    <div className="flex items-center gap-3">
                      <IconClock className="size-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Aufbau</p>
                        <p className="text-base font-medium text-foreground">
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
                        <p className="text-base font-medium text-foreground">
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
          </div>

          {/* Notizen */}
          <div className="space-y-3">
            {/* Kundenkommentar */}
            {(order.notes || editingNotes || isAdmin) && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <IconMessageCircle className="size-4 text-muted-foreground" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kundenkommentar</h3>
                  </div>
                  {isAdmin && !editingNotes && (
                    <button onClick={() => setEditingNotes(true)} className="text-muted-foreground hover:text-foreground/80 transition-colors">
                      <IconPencil className="size-4.5" />
                    </button>
                  )}
                  {editingNotes && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => { saveField({ notes: notesState || null }); setEditingNotes(false); }} className="text-emerald-400 hover:text-emerald-300"><IconCheck className="size-4" /></button>
                      <button onClick={() => { setNotesState(order.notes ?? ""); setEditingNotes(false); }} className="text-muted-foreground hover:text-foreground/80"><IconX className="size-4" /></button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                {editingNotes ? (
                  <textarea
                    value={notesState}
                    onChange={(e) => setNotesState(e.target.value)}
                    className="w-full h-24 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 resize-none"
                    placeholder="Kommentar..."
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{order.notes || <span className="text-muted-foreground italic">Kein Kommentar</span>}</p>
                )}
                </div>
              </div>
            )}

            {/* Intern */}
            {showInternal && (order.internalNotes || editingInternal || canEditInternalNotes) && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                <div className="flex items-center justify-between border-b border-amber-500/20 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <IconAlertCircle className="size-4 text-amber-400" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Intern</h3>
                  </div>
                  {canEditInternalNotes && !editingInternal && (
                    <button onClick={() => setEditingInternal(true)} className="text-muted-foreground hover:text-foreground/80 transition-colors">
                      <IconPencil className="size-4.5" />
                    </button>
                  )}
                  {editingInternal && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => { saveField({ internalNotes: internalState || null }); setEditingInternal(false); }} className="text-emerald-400 hover:text-emerald-300"><IconCheck className="size-4" /></button>
                      <button onClick={() => { setInternalState(order.internalNotes ?? ""); setEditingInternal(false); }} className="text-muted-foreground hover:text-foreground/80"><IconX className="size-4" /></button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                {editingInternal ? (
                  <textarea
                    value={internalState}
                    onChange={(e) => setInternalState(e.target.value)}
                    className="w-full h-24 rounded-lg border border-amber-500/20 bg-black/20 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 resize-none"
                    placeholder="Interner Kommentar..."
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.internalNotes || <span className="text-muted-foreground italic">Kein interner Kommentar</span>}</p>
                )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Drucklayouts ODER Kunden-Layout — entweder/oder */}
          {!order.graphicUrl && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-5 py-3 flex items-center gap-2">
                <IconPrinter className="size-4 text-primary" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Drucklayouts</h3>
              </div>
              <div className="p-5">
                <ImageGallery orderId={order.id} images={order.images} isAdmin={isAdmin} singleColumn />
              </div>
            </div>
          )}

          {/* Kunden-Layout */}
          {order.graphicUrl && (
            <>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border px-4 py-2.5 flex items-center gap-2">
                  <IconLayout className="size-4 text-primary" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kunden-Layout</h3>
                </div>
                <div className="p-4 space-y-3">
                <button onClick={() => setLayoutModalOpen(true)} className="block w-full">
                  <img src={order.graphicUrl} alt="Layout" className="rounded-lg border border-border max-h-64 mx-auto hover:opacity-80 transition-opacity cursor-pointer" />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLayoutModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-border bg-muted text-foreground/80 text-sm hover:bg-accent transition-colors"
                  >
                    <IconPhoto className="size-4" />
                    Vorschau
                  </button>
                  {!isDriverView && (
                    <a
                      href={order.designToken ? `/api/design/${order.designToken}/download-final` : order.graphicUrl.replace("layout-preview.png", "layout-final.png")}
                      download={`layout-${order.orderNumber}.png`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-border bg-muted text-foreground/80 text-sm hover:bg-accent transition-colors"
                    >
                      <IconFileDownload className="size-4" />
                      Herunterladen
                    </a>
                  )}
                </div>
                {isAdmin && !isDriverView && order.designToken && (
                  <a
                    href={`/design/${order.designToken}?admin=1`}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <IconEdit className="size-4" />
                    Design nachbearbeiten
                  </a>
                )}
                </div>
              </div>

              {/* Layout Modal */}
              {layoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setLayoutModalOpen(false)}>
                  <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setLayoutModalOpen(false)}
                      className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-accent transition-colors z-10"
                    >
                      ✕
                    </button>
                    <img
                      src={order.graphicUrl}
                      alt="Layout Vorschau"
                      className="max-w-[85vw] max-h-[80vh] rounded-xl border border-border shadow-2xl object-contain"
                    />
                    {!isDriverView && (
                      <a
                        href={order.graphicUrl.replace("layout-preview.png", "layout-final.png")}
                        download={`layout-${order.orderNumber}.png`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-black font-semibold text-sm transition-colors"
                      >
                        <IconFileDownload className="size-4" />
                        Layout herunterladen (ohne Platzhalter)
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Startscreen-Layout (immer anzeigen) */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3 flex items-center gap-2">
              <IconDeviceTv className="size-4 text-primary" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Startscreen-Layout</h3>
            </div>
            <div className="p-5">
              <ImageGallery orderId={order.id} images={order.startscreenImages} isAdmin={isAdmin} singleColumn type="startscreen" />
            </div>
          </div>

          {/* Kundenpreis */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3 flex items-center gap-2">
              <IconCurrencyEuro className="size-4 text-primary" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preiskalkulation</h3>
            </div>
            <div className="p-5">
            <div className="space-y-1">
              {order.boxPrice != null && <PriceRow label="Fotobox" value={order.boxPrice} />}
              {order.travelCost != null && <PriceRow label="Fahrtkosten" value={order.travelCost} />}
              {activeExtras.filter(e => e.price > 0).map((e) => (
                <PriceRow key={e.key} label={e.label} value={e.price} />
              ))}
              {order.extraPaperRolls > 0 && (
                <PriceRow
                  label={`Papierrolle${order.extraPaperRolls > 1 ? "n" : ""} (× ${order.extraPaperRolls})`}
                  value={paperRollsCost}
                />
              )}
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
              <div className="border-t border-border mt-2 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Gesamt</span>
                <span className="text-lg font-bold font-mono tabular-nums text-primary">
                  {customerTotal.toFixed(2)}&euro;
                </span>
              </div>
            </div>
            </div>
          </div>

          {/* Intern */}
          {showInternal && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
              <div className="border-b border-amber-500/20 px-5 py-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Intern</h3>
              </div>
              <div className="p-5">
              <div className="space-y-1">
                <PriceRow label="Kundenpreis" value={customerTotal} />
                {order.setupCost != null && (
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-sm text-muted-foreground">Aufbau</span>
                    <span className="text-sm font-mono tabular-nums text-red-400">
                      {Math.abs(order.setupCost).toFixed(2)}&euro;
                    </span>
                  </div>
                )}
                {order.materialCost != null && (
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-sm text-muted-foreground">Material</span>
                    <span className="text-sm font-mono tabular-nums text-red-400">
                      {Math.abs(order.materialCost).toFixed(2)}&euro;
                    </span>
                  </div>
                )}
                <div className="border-t border-amber-500/20 mt-2 pt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Gewinn</span>
                  <span className={"text-lg font-bold font-mono tabular-nums " + (internalProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {internalProfit.toFixed(2)}&euro;
                  </span>
                </div>
                <div className="border-t border-amber-500/20 mt-2 pt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Zahlweise</span>
                  <span
                    className={
                      "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide " +
                      (order.paymentMethod === "CASH"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-sky-500/15 text-sky-400")
                    }
                  >
                    <IconCash className="size-3.5" />
                    {order.paymentMethod === "CASH" ? "Bar" : "Rechnung"}
                  </span>
                </div>
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
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono tabular-nums text-foreground/80">{value.toFixed(2)}&euro;</span>
    </div>
  );
}
