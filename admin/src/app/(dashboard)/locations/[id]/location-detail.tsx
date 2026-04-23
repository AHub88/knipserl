"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconMapPin,
  IconDeviceFloppy,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type Location = {
  id: string;
  name: string;
  street: string | null;
  zip: string | null;
  city: string | null;
  distanceKm: number | null;
  customerTravelCost: number | null;
  driverCompensation: number | null;
  notes: string | null;
  usageCount: number;
};

type OrderRow = {
  id: string;
  orderNumber: number;
  customerName: string;
  eventType: string;
  eventDate: string;
  driverName: string | null;
  driverInitials: string | null;
  price: number;
  paid: boolean;
};

export function LocationDetailView({
  location,
  orders,
}: {
  location: Location;
  orders: OrderRow[];
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(location.notes ?? "");
  const [saving, setSaving] = useState(false);

  const totalRevenue = orders.reduce((s, o) => s + o.price, 0);
  const paidCount = orders.filter((o) => o.paid).length;

  async function handleSaveNotes() {
    setSaving(true);
    try {
      const res = await fetch(`/api/locations/${location.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("Fehler beim Speichern");
      toast.success("Hinweise gespeichert");
      router.refresh();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/locations"
          className="flex items-center justify-center size-9 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
            <IconMapPin className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {location.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {[location.street, [location.zip, location.city].filter(Boolean).join(" ")]
                .filter(Boolean)
                .join(", ") || "Keine Adresse"}
            </p>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Entfernung
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {location.distanceKm != null ? `${location.distanceKm} km` : "–"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Fahrtkosten Kunde
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {location.customerTravelCost != null ? `${location.customerTravelCost.toFixed(2)} €` : "–"}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-1">
            Vergütung Fahrer
          </p>
          <p className="text-2xl font-bold text-amber-400 tabular-nums">
            {location.driverCompensation != null ? `${location.driverCompensation.toFixed(2)} €` : "–"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Aufträge
          </p>
          <p className="text-2xl font-bold text-primary tabular-nums">
            {orders.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Umsatz
          </p>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">
            {totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })} &euro;
          </p>
        </div>
      </div>

      {/* Hinweise */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
            <IconAlertCircle className="size-4" />
            Hinweise zur Location
          </h2>
          <button
            onClick={handleSaveNotes}
            disabled={saving}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-black text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <IconDeviceFloppy className="size-3.5" />
            {saving ? "..." : "Speichern"}
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="z.B. Anfahrt über Hintereingang, Aufbau ab 14 Uhr möglich, Ansprechpartner vor Ort..."
          className="w-full h-28 rounded-lg border border-amber-500/20 bg-black/20 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors resize-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Aufträge */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/80">
            Aufträge an dieser Location
          </h2>
          <span className="text-xs text-muted-foreground">
            {paidCount}/{orders.length} bezahlt
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">Noch keine Aufträge</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  #
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Datum
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Kunde
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Event
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Fahrer
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                  Preis
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                  Bezahlt
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow
                  key={o.id}
                  onClick={() => router.push(`/orders/${o.id}`)}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-muted"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {o.orderNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm tabular-nums">
                    {new Date(o.eventDate).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-[180px]">
                    <span className="block truncate">{o.customerName}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {o.eventType}
                  </TableCell>
                  <TableCell className="text-sm text-foreground/80">
                    {o.driverInitials ?? o.driverName ?? (
                      <span className="text-muted-foreground italic">–</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-foreground tabular-nums">
                    {o.price.toFixed(2)}&nbsp;&euro;
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        "inline-block size-2.5 rounded-full " +
                        (o.paid ? "bg-emerald-400" : "bg-red-400/60")
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
