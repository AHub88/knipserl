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

export function FreeOrdersList({
  orders,
  linkBase = "/orders",
}: {
  orders: FreeOrder[];
  linkBase?: string;
}) {
  return (
    <div className="space-y-2">
      {orders.map((o) => {
        const city = extractCity(o.locationAddress);
        const locationLabel = o.locationName
          ? city && city !== o.locationName
            ? `${o.locationName} · ${city}`
            : o.locationName
          : o.locationAddress;
        const eventDate = new Date(o.eventDate);
        const dayNum = eventDate.getDate();
        const weekday = eventDate.toLocaleDateString("de-DE", { weekday: "short" }).toUpperCase();
        const monthShort = eventDate.toLocaleDateString("de-DE", { month: "short" });

        return (
          <div
            key={o.id}
            className="rounded-xl border border-border bg-card hover:border-emerald-500/30 transition-colors overflow-hidden"
          >
            <div className="flex">
              {/* Date block */}
              <div className="flex flex-col items-center justify-center w-[72px] sm:w-[88px] shrink-0 bg-emerald-500/[0.06] border-r border-border py-4 gap-0.5">
                <span className="text-[10px] font-bold tracking-wide text-emerald-500 leading-none">{weekday}</span>
                <span className="text-[28px] sm:text-[34px] font-extrabold text-foreground leading-none">{dayNum}</span>
                <span className="text-[11px] font-medium text-muted-foreground leading-none">{monthShort}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col gap-2">
                <Link href={`${linkBase}/${o.id}`} className="group flex flex-col gap-2">
                  {/* Row 1: Location (two lines) + countdown */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <IconMapPin className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[15px] sm:text-base font-semibold text-foreground leading-snug truncate group-hover:text-emerald-500 transition-colors">
                          {o.locationName || city || o.locationAddress}
                        </p>
                        {city && <p className="text-xs text-muted-foreground truncate">{o.locationAddress.match(/\d{5}\s+.+$/)?.[0] ?? city}</p>}
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/12 text-emerald-500 px-1.5 py-1 shrink-0 leading-none whitespace-nowrap">
                      {daysUntil(o.eventDate)}
                    </span>
                  </div>

                  {/* Row 2: Customer · Event · Distance */}
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 ml-6">
                    <span className="text-sm text-foreground/80 font-medium">{o.customerName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-semibold text-muted-foreground">{o.eventType}</span>
                    {o.distanceKm != null && (
                      <span className="flex items-center gap-1 text-sm font-bold text-foreground/70 ml-auto">
                        <IconRoute className="size-3.5 shrink-0 text-muted-foreground" />
                        {Math.round(o.distanceKm)} km
                      </span>
                    )}
                  </div>
                </Link>

                {/* Row 3: Action */}
                <div className="flex justify-end ml-6">
                  <ClaimButton orderId={o.id} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
