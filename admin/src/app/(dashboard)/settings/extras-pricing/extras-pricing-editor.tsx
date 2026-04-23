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
    "h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground text-right font-mono tabular-nums outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors";

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft className="size-4" />
          Einstellungen
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <IconDeviceFloppy className="size-4" />
          {saving ? "..." : "Speichern"}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Fotobox */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <span className="text-sm font-semibold text-primary">Fotobox (Grundpreis)</span>
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
            className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0"
          >
            <span className="text-sm text-foreground/80">
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

      <p className="text-xs text-muted-foreground">
        Drucker ist im Grundpreis enthalten und hat keinen eigenen Aufpreis.
      </p>
    </div>
  );
}
