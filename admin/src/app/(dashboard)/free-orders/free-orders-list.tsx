"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconCalendar,
  IconMapPin,
  IconTag,
  IconRoute,
  IconCheck,
  IconChevronRight,
} from "@tabler/icons-react";
import { toast } from "sonner";

export type FreeOrder = {
  id: string;
  orderNumber: number;
  customerName: string;
  eventType: string;
  eventDate: string;
  locationName: string;
  locationAddress: string;
  distanceKm: number | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function extractCity(address: string): string {
  return address.match(/\d{5}\s+(.+)$/)?.[1]?.trim() ?? "";
}

function daysUntil(iso: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((new Date(iso).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Heute";
  if (diff === 1) return "Morgen";
  if (diff < 7) return `in ${diff} Tagen`;
  if (diff < 14) return `in 1 Woche`;
  return `in ${Math.floor(diff / 7)} Wochen`;
}

function ClaimButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClaim(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: "self" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler");
      }
      toast.success("Auftrag übernommen — taucht jetzt unter ‚Meine Aufträge‘ auf");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClaim}
      disabled={loading}
      className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50 transition-colors shrink-0"
    >
      <IconCheck className="size-4" />
      {loading ? "Übernehmen…" : "Übernehmen"}
    </button>
  );
}

export function FreeOrdersList({ orders }: { orders: FreeOrder[] }) {
  return (
    <div className="space-y-2">
      {orders.map((o) => {
        const city = extractCity(o.locationAddress);
        const locationLabel = o.locationName
          ? city && city !== o.locationName
            ? `${o.locationName} · ${city}`
            : o.locationName
          : o.locationAddress;
        return (
          <div
            key={o.id}
            className="rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-emerald-500/30 transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5">
              <Link
                href={`/orders/${o.id}`}
                className="flex-1 min-w-0 group"
              >
                <div className="flex items-baseline justify-between gap-2 mb-1.5 lg:mb-2">
                  <p className="font-semibold text-foreground truncate group-hover:text-emerald-500 transition-colors">
                    {o.customerName}
                  </p>
                  <span className="lg:hidden text-[10px] font-semibold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 shrink-0">
                    {daysUntil(o.eventDate)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center gap-y-1 gap-x-4 lg:gap-x-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 truncate">
                    <IconCalendar className="size-3.5 shrink-0" />
                    {formatDate(o.eventDate)}
                  </span>
                  <span className="flex items-center gap-1.5 truncate">
                    <IconTag className="size-3.5 shrink-0" />
                    {o.eventType}
                  </span>
                  <span className="flex items-center gap-1.5 truncate min-w-0">
                    <IconMapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{locationLabel}</span>
                  </span>
                  {o.distanceKm != null && (
                    <span className="flex items-center gap-1.5 truncate">
                      <IconRoute className="size-3.5 shrink-0" />
                      {Math.round(o.distanceKm)} km
                    </span>
                  )}
                </div>
              </Link>
              <div className="flex items-center justify-end gap-2 lg:gap-3 shrink-0">
                <span className="hidden lg:inline-flex text-[10px] font-semibold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5">
                  {daysUntil(o.eventDate)}
                </span>
                <ClaimButton orderId={o.id} />
                <Link
                  href={`/orders/${o.id}`}
                  aria-label="Details öffnen"
                  className="hidden sm:flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                >
                  <IconChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
