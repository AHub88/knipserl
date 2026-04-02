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
  hasInvoice: boolean;
};

type CompanyOption = {
  id: string;
  name: string;
  isKleinunternehmer: boolean;
};

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

export function InvoiceForm({
  orders,
  companies,
}: {
  orders: OrderOption[];
  companies: CompanyOption[];
}) {
  const router = useRouter();
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const selectedCompany = companies.find(
    (c) => c.id === selectedOrder?.companyId
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  // When an order is selected, auto-populate the first line item with order price
  function handleOrderChange(orderId: string) {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setItems([
        {
          description: `${order.eventType} \u2013 ${order.customerName}`,
          quantity: 1,
          unitPrice: order.price,
        },
      ]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedOrderId) {
      toast.error("Bitte einen Auftrag ausw\u00e4hlen");
      return;
    }

    if (!selectedOrder) return;

    const hasEmptyDesc = items.some((item) => !item.description.trim());
    if (hasEmptyDesc) {
      toast.error("Alle Positionen m\u00fcssen eine Beschreibung haben");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/accounting/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId,
          companyId: selectedOrder.companyId,
          items: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          dueDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Fehler beim Erstellen");
        return;
      }

      toast.success("Rechnung erstellt");
      router.push("/accounting/invoices");
      router.refresh();
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Order selection */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-zinc-300">Auftrag</Label>
          <select
            value={selectedOrderId}
            onChange={(e) => handleOrderChange(e.target.value)}
            className="flex h-8 w-full items-center rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-sm text-zinc-200 outline-none transition-colors focus:border-[#F6A11C]/50 focus:ring-2 focus:ring-[#F6A11C]/20"
          >
            <option value="" className="bg-zinc-900 text-zinc-400">
              Auftrag ausw&auml;hlen...
            </option>
            {orders.map((order) => (
              <option
                key={order.id}
                value={order.id}
                className="bg-zinc-900 text-zinc-200"
                disabled={order.hasInvoice}
              >
                #{order.orderNumber} &ndash; {order.customerName} &ndash;{" "}
                {order.eventType} ({formatCurrency(order.price)})
                {order.hasInvoice ? " [bereits erstellt]" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Firma</Label>
          <div className="flex h-8 items-center rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 text-sm text-zinc-400">
            {selectedCompany ? (
              <span className="text-zinc-200">{selectedCompany.name}</span>
            ) : (
              <span className="text-zinc-500 italic">
                Wird vom Auftrag \u00fcbernommen
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Due date */}
      <div className="max-w-xs space-y-2">
        <Label className="text-zinc-300">F&auml;llig am</Label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-white/[0.04] border-white/[0.1] text-zinc-200 focus:border-[#F6A11C]/50 focus:ring-[#F6A11C]/20"
        />
      </div>

      {/* Line items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-zinc-300">Positionen</Label>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.08]"
          >
            <IconPlus className="size-3.5" />
            Position hinzuf&uuml;gen
          </button>
        </div>

        <div className="rounded-lg border border-white/[0.10] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_100px_130px_130px_40px] gap-3 px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.10]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Beschreibung
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-center">
              Menge
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">
              Einzelpreis
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">
              Gesamt
            </span>
            <span />
          </div>

          {/* Items */}
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_100px_130px_130px_40px] gap-3 items-center px-4 py-2 border-b border-white/[0.04] last:border-b-0"
            >
              <Input
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                placeholder="Beschreibung..."
                className="bg-transparent border-white/[0.08] text-zinc-200 text-sm h-7"
              />
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", parseInt(e.target.value) || 1)
                }
                className="bg-transparent border-white/[0.08] text-zinc-200 text-sm h-7 text-center"
              />
              <Input
                type="number"
                min={0}
                step={0.01}
                value={item.unitPrice}
                onChange={(e) =>
                  updateItem(
                    index,
                    "unitPrice",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="bg-transparent border-white/[0.08] text-zinc-200 text-sm h-7 text-right"
              />
              <div className="text-sm font-mono text-zinc-300 text-right tabular-nums">
                {formatCurrency(item.quantity * item.unitPrice)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
                className="flex items-center justify-center size-7 rounded-md text-zinc-500 transition-colors hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <IconTrash className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-end">
          <div className="flex items-center gap-6 rounded-lg bg-white/[0.03] border border-white/[0.10] px-5 py-3">
            <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Gesamtbetrag
            </span>
            <span className="text-xl font-bold text-zinc-100 tabular-nums font-mono">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Kleinunternehmer notice */}
      {selectedCompany?.isKleinunternehmer !== false && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-amber-300/80">
            Gem&auml;&szlig; &sect;19 UStG wird keine Umsatzsteuer berechnet.
          </p>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={submitting || !selectedOrderId}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F6A11C] px-5 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#F6A11C]/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Wird erstellt..." : "Rechnung erstellen"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/accounting/invoices")}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-5 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
