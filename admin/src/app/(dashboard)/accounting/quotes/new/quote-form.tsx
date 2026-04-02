"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPlus, IconTrash } from "@tabler/icons-react";

type OrderOption = {
  id: string;
  orderNumber: number;
  customerName: string;
  eventType: string;
  eventDate: string;
  price: number;
  companyId: string;
  companyName: string;
};

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

function formatEUR(amount: number) {
  return amount.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export function QuoteForm({ orders }: { orders: OrderOption[] }) {
  const router = useRouter();
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [items]);

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedOrderId) {
      toast.error("Bitte einen Auftrag auswählen");
      return;
    }
    if (!validUntil) {
      toast.error("Bitte ein Gültigkeitsdatum angeben");
      return;
    }
    if (items.length === 0 || items.some((i) => !i.description.trim())) {
      toast.error("Alle Positionen müssen eine Beschreibung haben");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/accounting/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId,
          companyId: selectedOrder!.companyId,
          validUntil,
          items: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Erstellen des Angebots");
      }

      toast.success("Angebot erfolgreich erstellt");
      router.push("/accounting/quotes");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Order selection */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Auftrag
          </Label>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-white/[0.10] bg-card px-3 py-1 text-sm text-zinc-200 transition-colors focus:border-[#F6A11C]/50 focus:outline-none focus:ring-2 focus:ring-[#F6A11C]/20"
          >
            <option value="" className="bg-card text-zinc-400">
              Auftrag auswählen...
            </option>
            {orders.map((order) => (
              <option
                key={order.id}
                value={order.id}
                className="bg-card text-zinc-200"
              >
                #{order.orderNumber} - {order.customerName} ({order.eventType},{" "}
                {new Date(order.eventDate).toLocaleDateString("de-DE")})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Firma
          </Label>
          <div className="flex h-9 w-full items-center rounded-lg border border-white/[0.10] bg-card px-3 text-sm text-zinc-400">
            {selectedOrder ? (
              <span className="text-zinc-200">{selectedOrder.companyName}</span>
            ) : (
              <span className="text-zinc-400">Wird vom Auftrag übernommen</span>
            )}
          </div>
        </div>
      </div>

      {/* Valid until */}
      <div className="max-w-xs space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Gültig bis
        </Label>
        <Input
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          className="border-white/[0.10] bg-card text-zinc-200 focus:border-[#F6A11C]/50 focus:ring-[#F6A11C]/20 [color-scheme:dark]"
        />
      </div>

      {/* Line items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Positionen
          </Label>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-card px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#1c1d20] hover:text-zinc-100"
          >
            <IconPlus className="size-3.5" />
            Position hinzufügen
          </button>
        </div>

        <div className="rounded-lg border border-white/[0.10] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_100px_140px_40px] gap-3 px-4 py-2.5 border-b border-white/[0.10] bg-card">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Beschreibung
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Menge
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Einzelpreis
            </span>
            <span />
          </div>

          {/* Rows */}
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_100px_140px_40px] gap-3 px-4 py-2.5 border-b border-white/[0.10] last:border-b-0 items-center"
            >
              <Input
                placeholder="Beschreibung der Leistung"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                className="border-white/[0.10] bg-card text-zinc-200 text-sm placeholder:text-zinc-400 focus:border-[#F6A11C]/50 focus:ring-[#F6A11C]/20"
              />
              <Input
                type="number"
                min={1}
                step={1}
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", parseInt(e.target.value) || 0)
                }
                className="border-white/[0.10] bg-card text-zinc-200 text-sm tabular-nums focus:border-[#F6A11C]/50 focus:ring-[#F6A11C]/20"
              />
              <Input
                type="number"
                min={0}
                step={0.01}
                value={item.unitPrice || ""}
                onChange={(e) =>
                  updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                }
                placeholder="0,00"
                className="border-white/[0.10] bg-card text-zinc-200 text-sm tabular-nums placeholder:text-zinc-400 focus:border-[#F6A11C]/50 focus:ring-[#F6A11C]/20"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
                className="flex items-center justify-center size-8 rounded-md text-muted-foreground transition-colors hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:pointer-events-none"
              >
                <IconTrash className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <span className="text-sm font-medium text-zinc-400">Gesamt:</span>
          <span className="text-xl font-bold text-zinc-100 tabular-nums">
            {formatEUR(total)}
          </span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.10]">
        <button
          type="button"
          onClick={() => router.push("/accounting/quotes")}
          className="rounded-lg border border-white/[0.10] bg-card px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-[#1c1d20] hover:text-zinc-200"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F6A11C] px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#F6A11C]/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? "Wird erstellt..." : "Angebot erstellen"}
        </button>
      </div>
    </form>
  );
}
