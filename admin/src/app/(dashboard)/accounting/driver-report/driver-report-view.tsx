"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconTruck,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconExternalLink,
  IconUsers,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { getDriverCompensation } from "@/lib/driver-compensation";

type Driver = { id: string; name: string; initials: string | null };
type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  eventDate: string;
  paymentMethod: string;
  price: number;
  setupCost: number;
  locationName: string;
  extras: string[];
  driverBonus: unknown;
  driverId: string | null;
  driverName: string | null;
  driverInitials: string | null;
  secondDriverId: string | null;
  secondDriverName: string | null;
  secondDriverInitials: string | null;
};

type Entry = {
  order: Order;
  driverId: string;
  driverName: string;
  driverInitials: string | null;
  /** Anteil dieses Fahrers an der Gesamt-Vergütung (perDriver) */
  share: number;
  /** Vergütung des Auftrags insgesamt (base + bonus) */
  total: number;
  /** True wenn 50/50 mit anderem Fahrer geteilt */
  shared: boolean;
  /** Name des Mit-Fahrers (für Anzeige bei shared=true) */
  partnerName: string | null;
};

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export function DriverReportView({
  drivers,
  orders,
  driverBonusPrices,
}: {
  drivers: Driver[];
  orders: Order[];
  driverBonusPrices: Record<string, number>;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDriverId, setSelectedDriverId] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("INVOICE");

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  // Erzeuge pro Order einen Eintrag pro beteiligtem Fahrer (50/50 bei Zweitfahrer).
  // Filter danach: Monat, Zahlart, Fahrer.
  const entries = useMemo<Entry[]>(() => {
    const out: Entry[] = [];
    for (const o of orders) {
      const d = new Date(o.eventDate);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      if (paymentFilter !== "all" && o.paymentMethod !== paymentFilter) continue;

      const comp = getDriverCompensation({
        setupCost: o.setupCost,
        extras: o.extras,
        driverBonus: o.driverBonus,
        hasSecondDriver: !!o.secondDriverId,
        livePrices: driverBonusPrices,
      });

      const shared = !!(o.driverId && o.secondDriverId);

      if (o.driverId) {
        out.push({
          order: o,
          driverId: o.driverId,
          driverName: o.driverName ?? "—",
          driverInitials: o.driverInitials,
          share: comp.perDriver,
          total: comp.total,
          shared,
          partnerName: shared ? o.secondDriverName : null,
        });
      }
      if (o.secondDriverId) {
        out.push({
          order: o,
          driverId: o.secondDriverId,
          driverName: o.secondDriverName ?? "—",
          driverInitials: o.secondDriverInitials,
          share: comp.perDriver,
          total: comp.total,
          shared,
          partnerName: shared ? o.driverName : null,
        });
      }
    }
    if (selectedDriverId !== "all") {
      return out.filter((e) => e.driverId === selectedDriverId);
    }
    return out;
  }, [orders, year, month, paymentFilter, selectedDriverId, driverBonusPrices]);

  // Group by driver
  const driverGroups = useMemo(() => {
    const groups: Record<string, { driver: Driver; entries: Entry[]; total: number }> = {};
    for (const e of entries) {
      if (!groups[e.driverId]) {
        const driver = drivers.find((d) => d.id === e.driverId);
        groups[e.driverId] = {
          driver: driver ?? { id: e.driverId, name: e.driverName, initials: e.driverInitials },
          entries: [],
          total: 0,
        };
      }
      groups[e.driverId].entries.push(e);
      groups[e.driverId].total += e.share;
    }
    return Object.values(groups).sort((a, b) => a.driver.name.localeCompare(b.driver.name));
  }, [entries, drivers]);

  const grandTotal = driverGroups.reduce((s, g) => s + g.total, 0);

  function copyReport() {
    const lines: string[] = [];
    lines.push(`Fahrer-Vergütungen ${MONTHS[month]} ${year}`);
    lines.push(`Zahlart: ${paymentFilter === "all" ? "Alle" : paymentFilter === "INVOICE" ? "Rechnung" : "Bar"}`);
    lines.push("");
    for (const g of driverGroups) {
      lines.push(`${g.driver.name} (${g.driver.initials ?? ""}):`);
      for (const e of g.entries) {
        const d = new Date(e.order.eventDate);
        const sharedNote = e.shared ? ` (50/50${e.partnerName ? ` mit ${e.partnerName}` : ""})` : "";
        lines.push(`  #${e.order.orderNumber} ${d.toLocaleDateString("de-DE")} ${e.order.customerName} – ${e.order.locationName} → ${e.share.toFixed(2)} €${sharedNote}`);
      }
      lines.push(`  Gesamt: ${g.total.toFixed(2)} €`);
      lines.push("");
    }
    lines.push(`Gesamtsumme: ${grandTotal.toFixed(2)} €`);
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Report kopiert");
  }

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
          <IconTruck className="size-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Fahrer-Vergütungen
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Aufbau-Pauschale + Bonus pro Extra · 50/50 bei Zweitfahrer
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Month selector */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card">
          <button onClick={prevMonth} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <IconChevronLeft className="size-4" />
          </button>
          <span className="px-3 py-1.5 text-sm font-semibold text-foreground min-w-[140px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <IconChevronRight className="size-4" />
          </button>
        </div>

        {/* Driver filter */}
        <select
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(e.target.value)}
          className="h-9 rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none cursor-pointer"
        >
          <option value="all">Alle Fahrer</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>{d.name} {d.initials ? `(${d.initials})` : ""}</option>
          ))}
        </select>

        {/* Payment filter */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {[
            { key: "INVOICE", label: "Rechnung" },
            { key: "CASH", label: "Bar" },
            { key: "all", label: "Alle" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPaymentFilter(opt.key)}
              className={
                "px-3 py-1.5 text-xs font-medium transition-colors " +
                (paymentFilter === opt.key
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={copyReport}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-muted-foreground text-xs font-medium hover:text-foreground transition-colors ml-auto"
        >
          <IconCopy className="size-3.5" />
          Kopieren
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-2xl font-bold text-foreground tabular-nums">{entries.length}</p>
          <p className="text-[11px] text-muted-foreground/70">Einsätze</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-2xl font-bold text-foreground tabular-nums">{driverGroups.length}</p>
          <p className="text-[11px] text-muted-foreground/70">Fahrer</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">{grandTotal.toFixed(2)} €</p>
          <p className="text-[11px] text-muted-foreground/70">Gesamtvergütung</p>
        </div>
      </div>

      {/* Driver groups */}
      {driverGroups.length === 0 ? (
        <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 text-muted-foreground">
          <IconTruck className="size-10 mb-3 text-muted-foreground" />
          <p className="text-sm">Keine Fahrten in diesem Monat</p>
        </div>
      ) : (
        <div className="space-y-4">
          {driverGroups.map((group) => (
            <div key={group.driver.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Driver header */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center size-8 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold">
                    {group.driver.initials || group.driver.name.charAt(0)}
                  </span>
                  <div>
                    <span className="text-sm font-semibold text-foreground">{group.driver.name}</span>
                    <span className="text-xs text-muted-foreground/70 ml-2">{group.entries.length} Einsätze</span>
                  </div>
                </div>
                <span className="text-base font-bold text-emerald-400 tabular-nums">
                  {group.total.toFixed(2)} €
                </span>
              </div>

              {/* Entries */}
              <div className="divide-y divide-border">
                {group.entries.map((e) => (
                  <Link
                    key={`${e.order.id}-${e.driverId}`}
                    href={`/orders/${e.order.id}`}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground/70 shrink-0">#{e.order.orderNumber}</span>
                      <span className="text-xs text-muted-foreground/70 tabular-nums shrink-0">{fmtDate(e.order.eventDate)}</span>
                      <span className="text-sm text-foreground/80 truncate">{e.order.customerName}</span>
                      <span className="text-xs text-muted-foreground/70 truncate hidden sm:inline">{e.order.locationName}</span>
                      {e.shared && (
                        <span
                          className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold rounded px-1.5 py-0.5 bg-amber-500/10 text-amber-400 shrink-0"
                          title={`50/50 mit ${e.partnerName ?? "Mit-Fahrer"}`}
                        >
                          <IconUsers className="size-3" />
                          50/50
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={"text-[10px] rounded px-1.5 py-0.5 font-semibold " + (e.order.paymentMethod === "INVOICE" ? "bg-purple-500/15 text-purple-400" : "bg-emerald-500/15 text-emerald-400")}>
                        {e.order.paymentMethod === "INVOICE" ? "RE" : "BAR"}
                      </span>
                      <span className="text-sm font-mono text-foreground/80 tabular-nums">{e.share.toFixed(2)} €</span>
                      <IconExternalLink className="size-3 text-muted-foreground/50 group-hover:text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
