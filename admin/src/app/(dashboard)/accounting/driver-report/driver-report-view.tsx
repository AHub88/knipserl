"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconTruck,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconExternalLink,
} from "@tabler/icons-react";
import { toast } from "sonner";

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
  driverId: string;
  driverName: string;
  driverInitials: string;
};

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export function DriverReportView({
  drivers,
  orders,
}: {
  drivers: Driver[];
  orders: Order[];
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

  // Filter orders by month, year, payment method, and driver
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.eventDate);
      if (d.getFullYear() !== year || d.getMonth() !== month) return false;
      if (paymentFilter !== "all" && o.paymentMethod !== paymentFilter) return false;
      if (selectedDriverId !== "all" && o.driverId !== selectedDriverId) return false;
      return true;
    });
  }, [orders, year, month, paymentFilter, selectedDriverId]);

  // Group by driver
  const driverGroups = useMemo(() => {
    const groups: Record<string, { driver: Driver; orders: Order[]; total: number }> = {};
    for (const o of filtered) {
      if (!groups[o.driverId]) {
        const driver = drivers.find((d) => d.id === o.driverId);
        groups[o.driverId] = {
          driver: driver ?? { id: o.driverId, name: o.driverName, initials: o.driverInitials },
          orders: [],
          total: 0,
        };
      }
      groups[o.driverId].orders.push(o);
      groups[o.driverId].total += Math.abs(o.setupCost);
    }
    return Object.values(groups).sort((a, b) => a.driver.name.localeCompare(b.driver.name));
  }, [filtered, drivers]);

  const grandTotal = driverGroups.reduce((s, g) => s + g.total, 0);

  function copyReport() {
    const lines: string[] = [];
    lines.push(`Fahrer-Vergütungen ${MONTHS[month]} ${year}`);
    lines.push(`Zahlart: ${paymentFilter === "all" ? "Alle" : paymentFilter === "INVOICE" ? "Rechnung" : "Bar"}`);
    lines.push("");
    for (const g of driverGroups) {
      lines.push(`${g.driver.name} (${g.driver.initials ?? ""}):`);
      for (const o of g.orders) {
        const d = new Date(o.eventDate);
        lines.push(`  #${o.orderNumber} ${d.toLocaleDateString("de-DE")} ${o.customerName} – ${o.locationName} → ${Math.abs(o.setupCost).toFixed(2)} €`);
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
            Monatliche Übersicht der Fahrer-Vergütungen
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
          <p className="text-2xl font-bold text-foreground tabular-nums">{filtered.length}</p>
          <p className="text-[11px] text-muted-foreground/70">Fahrten</p>
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
                    <span className="text-xs text-muted-foreground/70 ml-2">{group.orders.length} Fahrten</span>
                  </div>
                </div>
                <span className="text-base font-bold text-emerald-400 tabular-nums">
                  {group.total.toFixed(2)} €
                </span>
              </div>

              {/* Orders */}
              <div className="divide-y divide-border">
                {group.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground/70 shrink-0">#{order.orderNumber}</span>
                      <span className="text-xs text-muted-foreground/70 tabular-nums shrink-0">{fmtDate(order.eventDate)}</span>
                      <span className="text-sm text-foreground/80 truncate">{order.customerName}</span>
                      <span className="text-xs text-muted-foreground/70 truncate hidden sm:inline">{order.locationName}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={"text-[10px] rounded px-1.5 py-0.5 font-semibold " + (order.paymentMethod === "INVOICE" ? "bg-purple-500/15 text-purple-400" : "bg-emerald-500/15 text-emerald-400")}>
                        {order.paymentMethod === "INVOICE" ? "RE" : "BAR"}
                      </span>
                      <span className="text-sm font-mono text-foreground/80 tabular-nums">{Math.abs(order.setupCost).toFixed(2)} €</span>
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
