"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface OrderData {
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  eventDate: string;
  eventType: string;
  locationName: string;
  locationAddress: string;
  extras: string[];
  price: number;
  travelCost: number | null;
  boxPrice: number | null;
  extrasCost: number | null;
  setupDate: string | null;
  setupTime: string | null;
  teardownDate: string | null;
  teardownTime: string | null;
  notes: string | null;
  confirmed: boolean;
  confirmedByCustomerAt: string | null;
}

const EXTRAS_CONFIG = [
  { key: "Drucker", label: "Drucker", icon: "M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" },
  { key: "Props", label: "Requisiten", icon: "M12 8a4 4 0 100 8 4 4 0 000-8zM3 12h1m16 0h1M12 3v1m0 16v1m-7.07-2.93l.71-.71m12.73-12.73l.7-.7M4.93 4.93l.71.71m12.73 12.73l.7.7" },
  { key: "Stick", label: "USB-Stick", icon: "M8 2h8l4 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8l4-6zM10 12v4M14 12v4" },
  { key: "HG", label: "Hintergrund", icon: "M3 3h18v18H3zM8.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21" },
  { key: "LOVE", label: "Love Letters", icon: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" },
  { key: "Social", label: "Online-Galerie", icon: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" },
  { key: "Book", label: "Gästebuch", icon: "M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" },
  { key: "TV", label: "TV Slideshow", icon: "M2 7h20v15H2zM17 2l-5 5-5-5" },
  { key: "Telefon", label: "Gästetelefon", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" },
] as const;

const EXTRAS_LABELS: Record<string, string> = Object.fromEntries(
  EXTRAS_CONFIG.map((e) => [e.key, e.label])
);

const EXTRAS_PRICES: Record<string, number> = {
  Props: 45,
  Telefon: 100,
  TV: 150,
  Stick: 20,
  HG: 50,
  Social: 50,
  Book: 30,
  LOVE: 150,
};

function formatDate(d: string): string {
  const date = new Date(d);
  const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  return `${days[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatShortDate(d: string): string {
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatAmount(v: number): string {
  return v.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ConfirmPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetch(`/api/confirm/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Auftrag nicht gefunden");
        return r.json();
      })
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleConfirm() {
    setConfirming(true);
    try {
      const res = await fetch(`/api/confirm/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: comment.trim() || undefined }),
      });
      const data = await res.json();
      if (data.confirmed || data.alreadyConfirmed) {
        setJustConfirmed(true);
        setOrder((prev) => prev ? { ...prev, confirmedByCustomerAt: new Date().toISOString(), confirmed: true } : prev);
      }
    } catch {
      setError("Bestätigung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center">
        <div className="text-zinc-400">Laden...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center p-4">
        <div className="bg-[#161719] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <img src="/logo.png" alt="Knipserl" className="h-12 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Auftrag nicht gefunden</h1>
          <p className="text-zinc-400 text-sm">Der Bestätigungslink ist ungültig oder abgelaufen.</p>
        </div>
      </div>
    );
  }

  const alreadyConfirmed = !!order.confirmedByCustomerAt;

  // Build cost breakdown
  const costLines: { label: string; amount: number }[] = [];
  costLines.push({ label: "Fotobox (inkl. Drucker)", amount: order.boxPrice ?? 379 });
  if (order.travelCost && order.travelCost > 0) {
    costLines.push({ label: "Anfahrt", amount: order.travelCost });
  }
  for (const extra of order.extras) {
    const price = EXTRAS_PRICES[extra];
    if (price && price > 0) {
      costLines.push({ label: EXTRAS_LABELS[extra] ?? extra, amount: price });
    }
  }
  const subtotal = costLines.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="min-h-screen bg-[#0d0e12] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Knipserl Fotobox" className="h-10 sm:h-14 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">Bitte prüfen Sie Ihre Event-Details</p>
        </div>

        {/* Card */}
        <div className="bg-[#161719] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          {/* Event Header */}
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Ihr Event</div>
            <h1 className="text-xl sm:text-3xl font-bold text-[#F6A11C] mb-1">{formatDate(order.eventDate)}</h1>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-base sm:text-lg font-semibold text-white">{order.customerName}</span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#222326] text-zinc-400 text-xs font-semibold uppercase">{order.eventType}</span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Location */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Location</h3>
              <div className="text-white font-medium">{order.locationName}</div>
              <div className="text-zinc-400 text-sm">{order.locationAddress}</div>
            </div>

            {/* Auf-/Abbau */}
            {(order.setupDate || order.teardownDate) && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Auf- & Abbau</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={"rounded-xl border p-3 sm:p-4 " + (order.setupDate ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 bg-white/[0.02] opacity-40")}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Aufbau</span>
                    </div>
                    {order.setupDate ? (
                      <>
                        <div className="text-white text-sm font-semibold">{formatShortDate(order.setupDate)}</div>
                        {order.setupTime && <div className="text-zinc-400 text-xs mt-0.5">{order.setupTime}</div>}
                      </>
                    ) : (
                      <div className="text-zinc-600 text-xs">Kein Termin</div>
                    )}
                  </div>
                  <div className={"rounded-xl border p-3 sm:p-4 " + (order.teardownDate ? "border-red-500/30 bg-red-500/5" : "border-white/5 bg-white/[0.02] opacity-40")}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-2 rounded-full bg-red-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Abbau</span>
                    </div>
                    {order.teardownDate ? (
                      <>
                        <div className="text-white text-sm font-semibold">{formatShortDate(order.teardownDate)}</div>
                        {order.teardownTime && <div className="text-zinc-400 text-xs mt-0.5">{order.teardownTime}</div>}
                      </>
                    ) : (
                      <div className="text-zinc-600 text-xs">Kein Termin</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Extras */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Zubehör & Extras</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {EXTRAS_CONFIG.map((cfg) => {
                  const active = order.extras.includes(cfg.key);
                  return (
                    <div
                      key={cfg.key}
                      className={
                        "flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-lg border transition-all " +
                        (active
                          ? "border-[#F6A11C]/40 bg-[#F6A11C]/10"
                          : "border-white/5 bg-white/[0.02] opacity-30")
                      }
                    >
                      <svg
                        className={"size-5 " + (active ? "text-[#F6A11C]" : "text-zinc-500")}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={cfg.icon} />
                      </svg>
                      <span className={"text-[10px] font-bold uppercase tracking-wide text-center leading-tight " + (active ? "text-[#F6A11C]" : "text-zinc-500")}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kostenaufstellung */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Kostenaufstellung</h3>
              <div className="bg-[#1c1d20] rounded-xl overflow-hidden">
                <div className="divide-y divide-white/5">
                  {costLines.map((line) => (
                    <div key={line.label} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm text-zinc-300">{line.label}</span>
                      <span className="text-sm text-zinc-300 font-medium tabular-nums">{formatAmount(line.amount)} €</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#F6A11C]/30 bg-[#F6A11C]/5">
                  <span className="text-sm sm:text-base font-bold text-white">Gesamtpreis</span>
                  <span className="text-lg sm:text-xl font-bold text-[#F6A11C] tabular-nums">{formatAmount(order.price)} €</span>
                </div>
              </div>
            </div>

            {/* Hinweise */}
            {order.notes && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Hinweise</h3>
                <div className="bg-[#1c1d20] rounded-lg p-3 text-sm text-zinc-300">{order.notes}</div>
              </div>
            )}
          </div>

          {/* Confirm Action */}
          <div className="p-6 sm:p-8 border-t border-white/10 bg-[#111214]">
            {alreadyConfirmed || justConfirmed ? (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <svg className="size-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span className="text-emerald-400 font-semibold">Details bestätigt</span>
                </div>
                {order.confirmedByCustomerAt && (
                  <p className="text-zinc-500 text-xs mt-2">
                    Bestätigt am {formatShortDate(order.confirmedByCustomerAt)} um {new Date(order.confirmedByCustomerAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                  </p>
                )}
                {justConfirmed && (
                  <p className="text-zinc-400 text-sm mt-3">Vielen Dank! Wir kümmern uns um den Rest und freuen uns auf Ihr Event.</p>
                )}
              </div>
            ) : (
              <div>
                {/* Kommentar */}
                <div className="mb-5">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
                    Anmerkungen <span className="font-normal text-zinc-600">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Haben Sie Wünsche oder Anmerkungen zu Ihrem Event?"
                    rows={3}
                    className="w-full bg-[#1c1d20] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/30 transition-colors resize-none"
                  />
                </div>
                <p className="text-zinc-400 text-sm mb-4 text-center">Stimmt alles? Dann bestätigen Sie bitte, damit wir Ihr Event perfekt vorbereiten können.</p>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full px-8 py-3.5 rounded-xl bg-[#F6A11C] text-black font-bold text-base hover:bg-[#F6A11C]/90 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {confirming ? "Wird bestätigt..." : "Alles korrekt – bestätigen"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-zinc-600 text-xs">
          Knipserl Fotobox · info@knipserl.de · www.knipserl.de
        </div>
      </div>
    </div>
  );
}
