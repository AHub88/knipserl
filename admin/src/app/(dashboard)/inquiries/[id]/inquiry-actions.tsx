"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconCheck,
  IconX,
  IconCash,
  IconFileInvoice,
  IconLoader2,
  IconBriefcase,
  IconUser,
  IconPrinter,
  IconMask,
  IconUsb,
  IconPhoto,
  IconHeart,
  IconWorldWww,
  IconBook,
  IconDeviceTv,
  IconPhone,
  IconCopy,
} from "@tabler/icons-react";
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

interface InquiryActionsProps {
  inquiryId: string;
  customerType: string;
  inquiryExtras: string[];
  distanceKm: number | null;
}

export function InquiryActions({
  inquiryId,
  customerType,
  inquiryExtras,
  distanceKm,
}: InquiryActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  // Pricing state
  const [extras, setExtras] = useState<string[]>(inquiryExtras);
  const [boxPrice, setBoxPrice] = useState(String(BOX_PRICE));
  const [travelCost, setTravelCost] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("AMOUNT");
  const [paymentMethod, setPaymentMethod] = useState<"INVOICE" | "CASH">("INVOICE");

  // Dynamic company type based on payment method
  const companyLabel = paymentMethod === "CASH" ? "Einzelunternehmen" : "GbR";

  // Auto-fetch travel cost based on distance
  useEffect(() => {
    if (distanceKm != null && distanceKm > 0) {
      fetch(`/api/travel-pricing/calculate?distanceKm=${distanceKm}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.customerPrice) setTravelCost(String(data.customerPrice));
        })
        .catch(() => {});
    }
  }, [distanceKm]);

  function toggleExtra(key: string) {
    setExtras((prev) => {
      const next = prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key];
      // Sofort auf der Inquiry persistieren — sonst gehen die Extras beim Refresh verloren
      fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateFields", extras: next }),
      }).catch(() => { /* ignore — wird beim Accept erneut geschrieben */ });
      return next;
    });
  }

  // Live calculation
  const calcBox = Number(boxPrice) || 0;
  const calcTravel = Number(travelCost) || 0;
  const calcExtras = calculateExtrasTotal(extras);
  const calcSubtotal = calcBox + calcTravel + calcExtras;
  const calcDiscount = Number(discount) || 0;
  const calcDiscountAmount = discountType === "PERCENT"
    ? (calcSubtotal * calcDiscount) / 100
    : calcDiscount;
  const calcTotal = Math.round((calcSubtotal - calcDiscountAmount) * 100) / 100;

  // Individual extras with prices for the summary
  const activeExtrasWithPrices = extras
    .map((key) => {
      const cfg = EXTRAS_CONFIG.find((e) => e.key === key);
      return cfg ? { label: cfg.label, price: EXTRAS_PRICES[key] ?? 0 } : null;
    })
    .filter(Boolean) as { label: string; price: number }[];

  function buildCalcText(): string {
    const lines: string[] = [];
    lines.push(`Fotobox: ${calcBox.toFixed(2)} €`);
    if (calcTravel > 0) {
      lines.push(`Fahrt${distanceKm ? ` (${distanceKm} km)` : ""}: ${calcTravel.toFixed(2)} €`);
    }
    for (const ext of activeExtrasWithPrices) {
      if (ext.price > 0) lines.push(`${ext.label}: ${ext.price.toFixed(2)} €`);
    }
    if (calcDiscountAmount > 0) {
      lines.push(`Rabatt${discountType === "PERCENT" ? ` (${calcDiscount}%)` : ""}: -${calcDiscountAmount.toFixed(2)} €`);
    }
    lines.push(`─────────────`);
    lines.push(`Gesamt: ${calcTotal.toFixed(2)} €`);
    return lines.join("\n");
  }

  function copyCalc() {
    navigator.clipboard.writeText(buildCalcText());
    toast.success("Kalkulation kopiert");
  }

  async function handleAction(action: "accept" | "reject") {
    if (action === "accept" && calcTotal <= 0) {
      toast.error("Bitte einen gültigen Preis konfigurieren");
      return;
    }

    setLoading(action);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          price: action === "accept" ? calcTotal : undefined,
          boxPrice: action === "accept" ? calcBox : undefined,
          travelCost: action === "accept" ? calcTravel : undefined,
          extrasCost: action === "accept" ? calcExtras : undefined,
          discount: action === "accept" && calcDiscount > 0 ? calcDiscount : undefined,
          discountType: action === "accept" && calcDiscount > 0 ? discountType : undefined,
          extras: action === "accept" ? extras : undefined,
          paymentMethod: action === "accept" ? paymentMethod : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler bei der Verarbeitung");
      }

      toast.success(
        action === "accept"
          ? "Anfrage zugesagt – Auftrag erstellt"
          : "Anfrage abgesagt"
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(null);
    }
  }

  const inputClass = "h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors";
  const labelClass = "block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1";

  return (
    <div className="rounded-xl border border-primary/20 bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-primary/20 px-4 sm:px-5 py-3">
        <h2 className="text-sm font-semibold text-foreground">Anfrage bearbeiten</h2>
        <span className={
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border transition-colors " +
          (paymentMethod === "INVOICE"
            ? "bg-blue-500/10 text-blue-400 border-blue-500/25"
            : "bg-zinc-500/10 text-muted-foreground border-zinc-500/25")
        }>
          {paymentMethod === "INVOICE" ? <IconBriefcase className="size-3" /> : <IconUser className="size-3" />}
          {companyLabel}
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
      {/* Extras Selection */}
      <div>
        <p className={labelClass}>Extras</p>
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
                  "flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-3 min-w-[90px] text-xs font-medium transition-colors " +
                  (active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground/70 hover:text-foreground/80")
                }
              >
                <ext.icon className="size-5" />
                <span>{ext.label}</span>
                {price != null && price > 0 && (
                  <span className="text-[10px] opacity-60 tabular-nums">{price}&thinsp;&euro;</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price inputs */}
      <div className="grid gap-3 grid-cols-3">
        <div>
          <label className={labelClass}>Fotobox</label>
          <div className="relative">
            <input className={inputClass + " pr-10"} type="number" step="0.01" value={boxPrice} onChange={(e) => setBoxPrice(e.target.value)} />
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
            <div className={inputClass + " flex items-center bg-transparent text-muted-foreground cursor-default pr-10"}>
              {calcExtras.toFixed(2)}
            </div>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground/70">EUR</span>
          </div>
        </div>
      </div>

      {/* Discount */}
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
          <select className={inputClass + " cursor-pointer"} value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
            <option value="AMOUNT" className="bg-card">&euro;</option>
            <option value="PERCENT" className="bg-card">%</option>
          </select>
        </div>
      </div>

      {/* Live calculation */}
      <div className="rounded-lg bg-muted border border-border p-3 space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Fotobox</span>
          <span className="tabular-nums">{calcBox.toFixed(2)} &euro;</span>
        </div>
        {calcTravel > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fahrt{distanceKm ? ` (${distanceKm} km)` : ""}</span>
            <span className="tabular-nums">{calcTravel.toFixed(2)} &euro;</span>
          </div>
        )}
        {activeExtrasWithPrices.map((ext) => (
          ext.price > 0 && (
            <div key={ext.label} className="flex justify-between text-xs text-muted-foreground">
              <span>{ext.label}</span>
              <span className="tabular-nums">{ext.price.toFixed(2)} &euro;</span>
            </div>
          )
        ))}
        {calcDiscountAmount > 0 && (
          <div className="flex justify-between text-xs text-red-400">
            <span>Rabatt{discountType === "PERCENT" ? ` (${calcDiscount}%)` : ""}</span>
            <span className="tabular-nums">-{calcDiscountAmount.toFixed(2)} &euro;</span>
          </div>
        )}
        <div className="border-t border-border pt-1.5 flex justify-between items-center">
          <span className="text-sm font-semibold text-foreground">Gesamtpreis</span>
          <span className="text-lg font-bold text-primary tabular-nums">{calcTotal.toFixed(2)} &euro;</span>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={copyCalc}
          className="w-full flex items-center justify-center gap-1.5 mt-1.5 pt-1.5 border-t border-border text-[11px] text-muted-foreground/70 hover:text-foreground/80 transition-colors"
        >
          <IconCopy className="size-3" />
          Kalkulation kopieren
        </button>
      </div>

      {/* Payment method */}
      <div>
        <p className={labelClass}>Zahlungsart</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("INVOICE")}
            className={
              "flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
              (paymentMethod === "INVOICE"
                ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                : "border-border bg-muted text-muted-foreground/70 hover:text-foreground/80")
            }
          >
            <div className="flex items-center gap-2">
              <IconFileInvoice className="size-4" />
              Rechnung
            </div>
            <span className="text-[10px] opacity-70">GbR</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("CASH")}
            className={
              "flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
              (paymentMethod === "CASH"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-border bg-muted text-muted-foreground/70 hover:text-foreground/80")
            }
          >
            <div className="flex items-center gap-2">
              <IconCash className="size-4" />
              Bar
            </div>
            <span className="text-[10px] opacity-70">Einzelunternehmen</span>
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => handleAction("accept")}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading === "accept" ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconCheck className="size-4" />
          )}
          Zugesagt
        </button>
        <button
          onClick={() => handleAction("reject")}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-red-600/80 text-white font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {loading === "reject" ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconX className="size-4" />
          )}
          Abgesagt
        </button>
      </div>
      </div>
    </div>
  );
}
