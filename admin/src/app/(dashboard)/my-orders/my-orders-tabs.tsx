"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconCalendar,
  IconMapPin,
  IconTag,
  IconChevronRight,
  IconBoxAlignBottomLeft,
  IconBoxAlignTopRight,
} from "@tabler/icons-react";

interface OrderItem {
  id: string;
  customerName: string;
  eventDate: string;
  eventType: string;
  locationName: string;
  locationAddress: string;
  extras: string[];
  notes: string | null;
  status: string;
  compensation: number;
  setupDate: string | null;
  setupTime: string | null;
  teardownDate: string | null;
  teardownTime: string | null;
}

type Tab = "assigned" | "past";

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function extractCity(address: string): string {
  return address.match(/\d{5}\s+(.+)$/)?.[1]?.trim() ?? "";
}

function daysUntil(iso: string, now: Date) {
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Heute";
  if (diff === 1) return "Morgen";
  if (diff < 7) return `in ${diff} Tagen`;
  if (diff < 14) return `in 1 Woche`;
  return `in ${Math.floor(diff / 7)} Wochen`;
}

export function MyOrdersTabs({
  assignedOrders,
  pastOrders,
  nowIso,
}: {
  assignedOrders: OrderItem[];
  pastOrders: OrderItem[];
  nowIso: string;
}) {
  const [tab, setTab] = useState<Tab>("assigned");
  const now = new Date(nowIso);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "assigned", label: "Anstehend", count: assignedOrders.length },
    { key: "past", label: "Erledigt", count: pastOrders.length },
  ];

  return (
    <div>
      <div className="flex gap-1 rounded-xl bg-muted/40 border border-border p-1 mb-4">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                "flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors " +
                (active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60")
              }
            >
              {t.label}
              <span
                className={
                  "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold " +
                  (active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground")
                }
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "assigned" && (
        assignedOrders.length === 0 ? (
          <Empty text="Keine zugewiesenen Aufträge" />
        ) : (
          <div className="space-y-2">
            {assignedOrders.map((order) => (
              <AssignedCard key={order.id} order={order} now={now} />
            ))}
          </div>
        )
      )}

      {tab === "past" && (
        pastOrders.length === 0 ? (
          <Empty text="Noch keine erledigten Aufträge" />
        ) : (
          <div className="space-y-2">
            {pastOrders.map((order) => (
              <PastCard key={order.id} order={order} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function AssignedCard({ order, now }: { order: OrderItem; now: Date }) {
  const city = extractCity(order.locationAddress);
  const locationLabel = order.locationName
    ? city && city !== order.locationName
      ? `${order.locationName} · ${city}`
      : order.locationName
    : order.locationAddress;
  const hasDelivery = !!order.setupDate || !!order.teardownDate;
  const eventDate = new Date(order.eventDate);
  const dayNum = eventDate.getDate();
  const weekday = eventDate.toLocaleDateString("de-DE", { weekday: "short" });
  const monthShort = eventDate.toLocaleDateString("de-DE", { month: "short" });

  return (
    <div className="rounded-xl border border-border bg-card hover:border-primary/30 transition-colors overflow-hidden">
      <div className="flex">
        {/* Date block — left side accent */}
        <div className="flex flex-col items-center justify-center w-16 sm:w-20 shrink-0 bg-primary/8 border-r border-border px-2 py-3">
          <span className="text-[10px] font-semibold uppercase text-primary">{weekday}</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-foreground leading-none">{dayNum}</span>
          <span className="text-[11px] font-medium text-muted-foreground">{monthShort}</span>
          <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider rounded bg-primary/15 text-primary px-1.5 py-0.5 whitespace-nowrap">
            {daysUntil(order.eventDate, now)}
          </span>
        </div>

        {/* Content — right side */}
        <div className="flex-1 min-w-0 p-3 sm:p-4">
          {/* Location — most prominent */}
          <div className="flex items-start gap-2 mb-1.5">
            <IconMapPin className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold text-foreground truncate">{locationLabel}</p>
              {city && order.locationName && city !== order.locationName && (
                <p className="text-xs text-muted-foreground truncate">{order.locationAddress}</p>
              )}
            </div>
          </div>

          {/* Customer + Event type */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            <span className="font-medium text-foreground/80">{order.customerName}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-semibold">{order.eventType}</span>
            {order.compensation > 0 && (
              <span className="text-emerald-500 font-semibold">{order.compensation} €</span>
            )}
          </div>

          {/* Extras */}
          {order.extras.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {order.extras.map((e) => (
                <span key={e} className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium text-muted-foreground">{e}</span>
              ))}
            </div>
          )}

          {/* Delivery boxes */}
          {hasDelivery && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <DeliveryBox label="Aufbau" iso={order.setupDate} time={order.setupTime} tone="emerald" icon={<IconBoxAlignBottomLeft className="size-3.5" />} />
              <DeliveryBox label="Abbau" iso={order.teardownDate} time={order.teardownTime} tone="rose" icon={<IconBoxAlignTopRight className="size-3.5" />} />
            </div>
          )}

          <div className="flex justify-end">
            <Link
              href={`/orders/${order.id}`}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Details
              <IconChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PastCard({ order }: { order: OrderItem }) {
  const city = extractCity(order.locationAddress);
  const locationLabel = order.locationName
    ? city && city !== order.locationName
      ? `${order.locationName} · ${city}`
      : order.locationName
    : order.locationAddress;
  const eventDate = new Date(order.eventDate);
  const dayNum = eventDate.getDate();
  const monthShort = eventDate.toLocaleDateString("de-DE", { month: "short" });
  const yearShort = eventDate.toLocaleDateString("de-DE", { year: "2-digit" });

  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex items-center rounded-xl border border-border bg-card hover:border-primary/30 transition-colors overflow-hidden"
    >
      {/* Compact date block */}
      <div className="flex flex-col items-center justify-center w-14 sm:w-16 shrink-0 bg-muted/50 border-r border-border py-2.5 px-2">
        <span className="text-xl sm:text-2xl font-extrabold text-foreground/60 leading-none">{dayNum}</span>
        <span className="text-[10px] text-muted-foreground">{monthShort} {yearShort}</span>
      </div>
      <div className="flex-1 min-w-0 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <IconMapPin className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{locationLabel}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
          <span className="truncate">{order.customerName}</span>
          <span>·</span>
          <span>{order.eventType}</span>
        </div>
      </div>
      <IconChevronRight className="size-4 text-muted-foreground shrink-0 mr-3" />
    </Link>
  );
}

function DeliveryBox({
  label,
  iso,
  time,
  tone,
  icon,
}: {
  label: string;
  iso: string | null;
  time: string | null;
  tone: "emerald" | "rose";
  icon: React.ReactNode;
}) {
  const toneClasses =
    tone === "emerald"
      ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-500"
      : "border-rose-500/25 bg-rose-500/5 text-rose-500";
  return (
    <div
      className={
        "rounded-lg border p-2.5 " +
        (iso ? toneClasses : "border-border bg-muted/30 opacity-60")
      }
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={iso ? "" : "text-muted-foreground"}>{icon}</span>
        <span
          className={
            "text-[10px] font-bold uppercase tracking-wider " +
            (iso ? "" : "text-muted-foreground")
          }
        >
          {label}
        </span>
      </div>
      {iso ? (
        <>
          <div className="text-xs text-foreground font-medium">{formatDateShort(iso)}</div>
          {time && <div className="text-[11px] text-muted-foreground">{time}</div>}
        </>
      ) : (
        <div className="text-[11px] text-muted-foreground">Kein Termin</div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
