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

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <p className="font-semibold text-foreground truncate">{order.customerName}</p>
        <span className="text-[10px] font-semibold uppercase tracking-wider rounded-md bg-primary/10 text-primary px-1.5 py-0.5 shrink-0">
          {daysUntil(order.eventDate, now)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-1 gap-x-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 truncate">
          <IconCalendar className="size-3.5 shrink-0" />
          {formatDateLong(order.eventDate)}
        </span>
        <span className="flex items-center gap-1.5 truncate">
          <IconTag className="size-3.5 shrink-0" />
          {order.eventType}
        </span>
        <span className="flex items-center gap-1.5 truncate min-w-0">
          <IconMapPin className="size-3.5 shrink-0" />
          <span className="truncate">{locationLabel}</span>
        </span>
      </div>

      {order.extras.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {order.extras.map((e) => (
            <span
              key={e}
              className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground"
            >
              {e}
            </span>
          ))}
        </div>
      )}

      {hasDelivery && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <DeliveryBox
            label="Aufbau"
            iso={order.setupDate}
            time={order.setupTime}
            tone="emerald"
            icon={<IconBoxAlignBottomLeft className="size-3.5" />}
          />
          <DeliveryBox
            label="Abbau"
            iso={order.teardownDate}
            time={order.teardownTime}
            tone="rose"
            icon={<IconBoxAlignTopRight className="size-3.5" />}
          />
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Details ansehen
          <IconChevronRight className="size-4" />
        </Link>
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
  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-primary/30 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <p className="font-semibold text-foreground truncate">{order.customerName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 truncate">
            <IconCalendar className="size-3.5 shrink-0" />
            {formatDateShort(order.eventDate)}
          </span>
          <span className="flex items-center gap-1.5 truncate min-w-0">
            <IconMapPin className="size-3.5 shrink-0" />
            <span className="truncate">{locationLabel}</span>
          </span>
        </div>
      </div>
      <IconChevronRight className="size-4 text-muted-foreground shrink-0" />
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
