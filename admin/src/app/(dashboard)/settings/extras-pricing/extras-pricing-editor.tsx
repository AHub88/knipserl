"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { toast } from "sonner";

const EXTRAS_LABELS: Record<string, string> = {
  Props: "Requisiten",
  Telefon: "Telefon",
  TV: "TV",
  Stick: "USB Stick",
  HG: "Hintergrundsystem",
  Social: "Online Funktion",
  Book: "Gästebuch",
  LOVE: "LOVE Buchstaben",
};

export function ExtrasPricingEditor({
  boxPrice: initialBox,
  extras: initialExtras,
}: {
  boxPrice: number;
  extras: { key: string; price: number }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [boxPrice, setBoxPrice] = useState(String(initialBox));
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(initialExtras.map((e) => [e.key, String(e.price)]))
  );

  function updatePrice(key: string, value: string) {
    setPrices((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body: Record<string, string> = {
        price_box: boxPrice,
      };
      for (const [key, val] of Object.entries(prices)) {
        body[`price_${key}`] = val;
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Preise gespeichert");
      router.refresh();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-white/[0.08] bg-[#1a1d27] px-3 text-sm text-zinc-200 text-right font-mono tabular-nums outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors";

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <IconArrowLeft className="size-4" />
          Einstellungen
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 disabled:opacity-50 transition-colors"
        >
          <IconDeviceFloppy className="size-4" />
          {saving ? "..." : "Speichern"}
        </button>
      </div>

      <div className="rounded-xl border border-white/[0.10] bg-card overflow-hidden">
        {/* Fotobox */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.10]">
          <span className="text-sm font-semibold text-[#F6A11C]">Fotobox (Grundpreis)</span>
          <div className="flex items-center gap-1 w-28">
            <input
              className={inputClass}
              type="number"
              step="1"
              value={boxPrice}
              onChange={(e) => setBoxPrice(e.target.value)}
            />
            <span className="text-xs text-muted-foreground">&euro;</span>
          </div>
        </div>

        {/* Extras */}
        {initialExtras.map((e) => (
          <div
            key={e.key}
            className="flex items-center justify-between px-5 py-3 border-b border-white/[0.10] last:border-0"
          >
            <span className="text-sm text-zinc-300">
              {EXTRAS_LABELS[e.key] ?? e.key}
            </span>
            <div className="flex items-center gap-1 w-28">
              <input
                className={inputClass}
                type="number"
                step="1"
                value={prices[e.key] ?? "0"}
                onChange={(ev) => updatePrice(e.key, ev.target.value)}
              />
              <span className="text-xs text-muted-foreground">&euro;</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400">
        Drucker ist im Grundpreis enthalten und hat keinen eigenen Aufpreis.
      </p>
    </div>
  );
}
