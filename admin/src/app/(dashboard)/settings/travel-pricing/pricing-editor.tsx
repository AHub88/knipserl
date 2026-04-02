"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type Tier = {
  distanceKm: number;
  driverCompensation: number;
  customerPrice: number;
};

export function PricingEditor({
  initialTiers,
}: {
  initialTiers: Tier[];
}) {
  const router = useRouter();
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [saving, setSaving] = useState(false);

  function updateTier(index: number, field: keyof Tier, value: string) {
    setTiers((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, [field]: Number(value) || 0 } : t
      )
    );
  }

  function addTier() {
    const last = tiers[tiers.length - 1];
    const newKm = last ? last.distanceKm + 10 : 0;
    setTiers((prev) =>
      [...prev, { distanceKm: newKm, driverCompensation: 0, customerPrice: 0 }].sort(
        (a, b) => a.distanceKm - b.distanceKm
      )
    );
  }

  function removeTier(index: number) {
    if (tiers.length <= 1) return;
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    // Validate unique KM values
    const kms = tiers.map((t) => t.distanceKm);
    if (new Set(kms).size !== kms.length) {
      toast.error("KM-Werte müssen eindeutig sein");
      return;
    }

    setSaving(true);
    try {
      const sorted = [...tiers].sort((a, b) => a.distanceKm - b.distanceKm);
      const res = await fetch("/api/travel-pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sorted),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Speichern");
      }

      toast.success("Fahrtkosten-Tabelle gespeichert");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Fehler beim Speichern"
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-8 w-full rounded-md border border-white/[0.08] bg-[#1a1d27] px-2 text-sm text-zinc-200 text-right font-mono tabular-nums outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors";

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={addTier}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-white/[0.08] bg-[#1a1d27] text-zinc-300 text-sm font-medium hover:bg-[#1f2330] transition-colors"
        >
          <IconPlus className="size-4" />
          Stufe hinzufügen
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 disabled:opacity-50 transition-colors"
        >
          <IconDeviceFloppy className="size-4" />
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.10] bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/[0.10] hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[120px]">
                KM
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[160px]">
                Vergütung Fahrer
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[160px]">
                Preis Kunde
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers
              .sort((a, b) => a.distanceKm - b.distanceKm)
              .map((tier, i) => (
                <TableRow
                  key={i}
                  className="border-b border-white/[0.10] hover:bg-card"
                >
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <input
                        className={inputClass + " w-20"}
                        type="number"
                        min="0"
                        value={tier.distanceKm}
                        onChange={(e) =>
                          updateTier(i, "distanceKm", e.target.value)
                        }
                      />
                      <span className="text-xs text-muted-foreground">km</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <input
                        className={inputClass}
                        type="number"
                        step="0.01"
                        min="0"
                        value={tier.driverCompensation}
                        onChange={(e) =>
                          updateTier(i, "driverCompensation", e.target.value)
                        }
                      />
                      <span className="text-xs text-muted-foreground">&euro;</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <input
                        className={inputClass}
                        type="number"
                        step="0.01"
                        min="0"
                        value={tier.customerPrice}
                        onChange={(e) =>
                          updateTier(i, "customerPrice", e.target.value)
                        }
                      />
                      <span className="text-xs text-muted-foreground">&euro;</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => removeTier(i)}
                      disabled={tiers.length <= 1}
                      className="text-zinc-400 hover:text-red-400 disabled:opacity-30 transition-colors"
                    >
                      <IconTrash className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-zinc-400">
        Die Berechnung verwendet die h&ouml;chste Stufe &le; der tats&auml;chlichen Entfernung.
        Beispiel: 25 km → Stufe 20 km.
      </p>
    </div>
  );
}
