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

type Extra = { key: string; price: number; driverBonus: number };

export function ExtrasPricingEditor({
  boxPrice: initialBox,
  extras: initialExtras,
}: {
  boxPrice: number;
  extras: Extra[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [boxPrice, setBoxPrice] = useState(String(initialBox));
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(initialExtras.map((e) => [e.key, String(e.price)])),
  );
  const [bonuses, setBonuses] = useState<Record<string, string>>(
    Object.fromEntries(initialExtras.map((e) => [e.key, String(e.driverBonus)])),
  );

  function updatePrice(key: string, value: string) {
    setPrices((prev) => ({ ...prev, [key]: value }));
  }
  function updateBonus(key: string, value: string) {
    setBonuses((prev) => ({ ...prev, [key]: value }));
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
      for (const [key, val] of Object.entries(bonuses)) {
        body[`driver_bonus_${key}`] = val;
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
    <div className="space-y-4 max-w-2xl">
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
        {/* Spalten-Header */}
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-2.5 border-b border-border bg-muted/40">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Extra
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-32 text-right">
            Kundenpreis
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-32 text-right">
            Vergütung Fahrer
          </span>
        </div>

        {/* Fotobox */}
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3 border-b border-border">
          <span className="text-sm font-semibold text-primary">Fotobox (Grundpreis)</span>
          <div className="flex items-center gap-1 w-32">
            <input
              className={inputClass}
              type="number"
              step="1"
              value={boxPrice}
              onChange={(e) => setBoxPrice(e.target.value)}
            />
            <span className="text-xs text-muted-foreground">&euro;</span>
          </div>
          <div className="w-32 text-right text-xs text-muted-foreground/60">—</div>
        </div>

        {/* Extras */}
        {initialExtras.map((e) => (
          <div
            key={e.key}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3 border-b border-border last:border-0"
          >
            <span className="text-sm text-foreground/80">
              {EXTRAS_LABELS[e.key] ?? e.key}
            </span>
            <div className="flex items-center gap-1 w-32">
              <input
                className={inputClass}
                type="number"
                step="1"
                value={prices[e.key] ?? "0"}
                onChange={(ev) => updatePrice(e.key, ev.target.value)}
              />
              <span className="text-xs text-muted-foreground">&euro;</span>
            </div>
            <div className="flex items-center gap-1 w-32">
              <input
                className={inputClass}
                type="number"
                step="1"
                value={bonuses[e.key] ?? "0"}
                onChange={(ev) => updateBonus(e.key, ev.target.value)}
              />
              <span className="text-xs text-muted-foreground">&euro;</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Drucker ist im Grundpreis enthalten und hat keinen eigenen Aufpreis.</p>
        <p>
          <span className="text-foreground/80">Vergütung Fahrer:</span> wird pro Auftrag bei
          Anlage eingefroren. Spätere Änderungen wirken nur auf neue Aufträge.
        </p>
      </div>
    </div>
  );
}
