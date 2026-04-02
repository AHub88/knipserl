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

const EXTRAS_LABELS: Record<string, string> = {
  Drucker: "Drucker",
  Props: "Requisiten",
  Stick: "USB-Stick",
  HG: "Hintergrund",
  LOVE: "Love Letters",
  Social: "Online-Galerie",
  Book: "Gästebuch",
  TV: "TV Slideshow",
  Telefon: "Gästetelefon",
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

export default function ConfirmPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);

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
      const res = await fetch(`/api/confirm/${token}`, { method: "POST" });
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

  return (
    <div className="min-h-screen bg-[#0d0e12] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Knipserl Fotobox" className="h-14 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">Auftragsbestätigung</p>
        </div>

        {/* Card */}
        <div className="bg-[#161719] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          {/* Event Header */}
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Ihr Event</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F6A11C] mb-1">{formatDate(order.eventDate)}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-lg font-semibold text-white">{order.customerName}</span>
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
                <div className="space-y-2">
                  {order.setupDate && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F6A11C] text-black">Aufbau</span>
                      <span className="text-white text-sm font-medium">{formatShortDate(order.setupDate)}</span>
                      {order.setupTime && <span className="text-zinc-400 text-sm">{order.setupTime}</span>}
                    </div>
                  )}
                  {order.teardownDate && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500 text-white">Abbau</span>
                      <span className="text-white text-sm font-medium">{formatShortDate(order.teardownDate)}</span>
                      {order.teardownTime && <span className="text-zinc-400 text-sm">{order.teardownTime}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Extras */}
            {order.extras.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Zubehör & Extras</h3>
                <div className="flex flex-wrap gap-2">
                  {order.extras.map((e) => (
                    <span key={e} className="px-3 py-1.5 rounded-lg border border-[#F6A11C]/30 bg-[#F6A11C]/10 text-[#F6A11C] text-sm font-medium">
                      {EXTRAS_LABELS[e] || e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preis */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-zinc-400 font-medium">Gesamtpreis</span>
              <span className="text-2xl font-bold text-[#F6A11C]">{order.price.toFixed(2)} €</span>
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
                  <span className="text-emerald-400 font-semibold">Auftrag bestätigt</span>
                </div>
                {order.confirmedByCustomerAt && (
                  <p className="text-zinc-500 text-xs mt-2">
                    Bestätigt am {formatShortDate(order.confirmedByCustomerAt)} um {new Date(order.confirmedByCustomerAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                  </p>
                )}
                {justConfirmed && (
                  <p className="text-zinc-400 text-sm mt-3">Vielen Dank! Wir freuen uns auf Ihr Event.</p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-zinc-400 text-sm mb-4">Bitte prüfen Sie die Angaben und bestätigen Sie den Auftrag.</p>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#F6A11C] text-black font-bold text-base hover:bg-[#F6A11C]/90 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {confirming ? "Wird bestätigt..." : "Auftrag bestätigen"}
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
