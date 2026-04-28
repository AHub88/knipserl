"use client";

import { useState } from "react";
import Link from "next/link";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
}

function daysUntil(iso: string, now: Date) {
  const diff = Math.ceil((new Date(iso).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Heute";
  if (diff === 1) return "Morgen";
  return `${diff} Tage`;
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
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white/[0.03] border border-white/[0.06] p-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors " +
              (tab === t.key
                ? "bg-white/[0.08] text-zinc-100"
                : "text-zinc-500 active:bg-white/[0.04]")
            }
          >
            {t.label}
            <span className={
              "ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold " +
              (tab === t.key
                ? t.key === "assigned" ? "bg-white/[0.08] text-zinc-300"
                  : t.key === "open" ? "bg-amber-500/20 text-amber-400"
                  : "bg-emerald-500/20 text-emerald-400"
                : "bg-white/[0.06] text-zinc-500")
            }>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Zugewiesene Aufträge */}
      {tab === "assigned" && (
        assignedOrders.length === 0 ? (
          <Empty text="Keine zugewiesenen Aufträge" />
        ) : (
          <div className="space-y-2">
            {assignedOrders.map((order) => {
              const isUpcoming = new Date(order.eventDate) >= now;
              return (
                <div
                  key={order.id}
                  className={
                    "rounded-xl border overflow-hidden " +
                    (isUpcoming
                      ? "border-white/[0.08] bg-white/[0.03]"
                      : "border-white/[0.06] bg-white/[0.02]")
                  }
                >
                  <div className="flex items-center gap-3 p-3.5">
                    <DateBadge iso={order.eventDate} highlight={isUpcoming} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-200 truncate">{order.customerName}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{order.locationName}</div>
                      <div className="text-[10px] text-zinc-600">{order.eventType} · {formatDate(order.eventDate)}</div>
                    </div>
                    {isUpcoming && (
                      <div className="text-[10px] font-semibold text-zinc-400 shrink-0">
                        {daysUntil(order.eventDate, now)}
                      </div>
                    )}
                  </div>
                  <div className="px-3.5 pb-3.5 space-y-2">
                    {order.extras.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {order.extras.map((e) => (
                          <span key={e} className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[9px] text-zinc-500">{e}</span>
                        ))}
                      </div>
                    )}
                    <DeliveryInfo order={order} />
                    <Link
                      href={`/orders/${order.id}`}
                      className="block w-full py-2 rounded-lg bg-white/[0.06] text-center text-xs font-semibold text-zinc-300 active:bg-white/[0.1] transition-colors"
                    >
                      Details ansehen
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Erledigte Aufträge */}
      {tab === "past" && (
        pastOrders.length === 0 ? (
          <Empty text="Noch keine erledigten Aufträge" />
        ) : (
          <div className="space-y-2">
            {pastOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 active:bg-white/[0.04] transition-colors"
              >
                <DateBadge iso={order.eventDate} muted />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-zinc-400 truncate">{order.customerName}</div>
                  <div className="text-[11px] text-zinc-600">{order.locationName} · {formatDate(order.eventDate)}</div>
                </div>
                <svg className="size-4 text-zinc-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function DateBadge({ iso, highlight, muted }: { iso: string; highlight?: boolean; muted?: boolean }) {
  const d = new Date(iso);
  return (
    <div className={
      "flex flex-col items-center justify-center rounded-lg w-11 h-11 shrink-0 " +
      (highlight ? "bg-white/[0.06]" : muted ? "bg-white/[0.03]" : "bg-white/[0.05]")
    }>
      <div className={
        "text-sm font-bold leading-tight " +
        (highlight ? "text-zinc-400" : muted ? "text-zinc-600" : "text-zinc-300")
      }>
        {d.getDate()}
      </div>
      <div className={
        "text-[9px] uppercase font-semibold leading-tight " +
        (highlight ? "text-zinc-400/50" : muted ? "text-zinc-700" : "text-zinc-600")
      }>
        {d.toLocaleDateString("de-DE", { month: "short" })}
      </div>
    </div>
  );
}

function DeliveryInfo({ order }: { order: OrderItem }) {
  if (!order.setupDate && !order.teardownDate) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className={
        "rounded-lg border p-2.5 " +
        (order.setupDate ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/[0.04] bg-white/[0.02] opacity-40")
      }>
        <div className="flex items-center gap-1.5 mb-1">
          <div className="size-1.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Aufbau</span>
        </div>
        {order.setupDate ? (
          <>
            <div className="text-xs text-zinc-300 font-medium">{formatDate(order.setupDate)}</div>
            {order.setupTime && <div className="text-[11px] text-zinc-500">{order.setupTime}</div>}
          </>
        ) : (
          <div className="text-[11px] text-zinc-600">Kein Termin</div>
        )}
      </div>
      <div className={
        "rounded-lg border p-2.5 " +
        (order.teardownDate ? "border-red-500/20 bg-red-500/5" : "border-white/[0.04] bg-white/[0.02] opacity-40")
      }>
        <div className="flex items-center gap-1.5 mb-1">
          <div className="size-1.5 rounded-full bg-red-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">Abbau</span>
        </div>
        {order.teardownDate ? (
          <>
            <div className="text-xs text-zinc-300 font-medium">{formatDate(order.teardownDate)}</div>
            {order.teardownTime && <div className="text-[11px] text-zinc-500">{order.teardownTime}</div>}
          </>
        ) : (
          <div className="text-[11px] text-zinc-600">Kein Termin</div>
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-12 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}
