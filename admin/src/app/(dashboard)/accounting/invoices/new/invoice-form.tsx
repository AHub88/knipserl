"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconPlus, IconX, IconLoader2, IconSearch } from "@tabler/icons-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = {
  companies: { id: string; name: string }[];
  orders: {
    id: string;
    orderNumber: number;
    customerName: string;
    price: number;
    companyId: string;
    hasInvoice: boolean;
  }[];
};

type CustomerResult = {
  id: string;
  name: string;
  email: string;
  company?: string;
};

type StandardLineItem = {
  id: string;
  title: string;
  description?: string;
  unitPrice: number;
};

type LineItem = {
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEUR(amount: number) {
  return amount.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Shared classes
// ---------------------------------------------------------------------------

const inputClass =
  "h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1";

const selectClass =
  "h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors appearance-none";

const cardClass =
  "rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3";

const sectionTitle =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InvoiceForm({ companies, orders }: Props) {
  const router = useRouter();

  // Company
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");

  // Customer search
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerResult[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recipient
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  // Order link
  const [selectedOrderId, setSelectedOrderId] = useState("");

  // Dates
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [deliveryDate, setDeliveryDate] = useState("");

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { title: "", description: "", quantity: 1, unitPrice: 0 },
  ]);

  // Standard line items
  const [standardItems, setStandardItems] = useState<StandardLineItem[]>([]);
  const [showStandardDropdown, setShowStandardDropdown] = useState(false);
  const [standardLoading, setStandardLoading] = useState(false);
  const standardRef = useRef<HTMLDivElement>(null);

  // Notes
  const [notes, setNotes] = useState("");

  // Submit
  const [submitting, setSubmitting] = useState(false);

  // ---------------------------------------------------------------------------
  // Customer search
  // ---------------------------------------------------------------------------

  const searchCustomers = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      return;
    }
    setCustomerLoading(true);
    try {
      const res = await fetch(`/api/customers/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerResults(data);
        setShowCustomerDropdown(true);
      }
    } catch {
      // silently fail
    } finally {
      setCustomerLoading(false);
    }
  }, []);

  function handleCustomerInput(value: string) {
    setCustomerQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchCustomers(value), 300);
  }

  function selectCustomer(c: CustomerResult) {
    setRecipientName(c.name);
    setRecipientEmail(c.email ?? "");
    setCustomerQuery(c.name);
    setShowCustomerDropdown(false);
  }

  // Close customer dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close standard dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (standardRef.current && !standardRef.current.contains(e.target as Node)) {
        setShowStandardDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ---------------------------------------------------------------------------
  // Order selection
  // ---------------------------------------------------------------------------

  function handleOrderChange(orderId: string) {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setCompanyId(order.companyId);
      setItems([
        {
          title: `Fotografie – ${order.customerName}`,
          description: "",
          quantity: 1,
          unitPrice: order.price,
        },
      ]);
    }
  }

  // ---------------------------------------------------------------------------
  // Standard line items
  // ---------------------------------------------------------------------------

  async function loadStandardItems() {
    if (standardItems.length > 0) {
      setShowStandardDropdown(true);
      return;
    }
    setStandardLoading(true);
    try {
      const res = await fetch("/api/standard-line-items");
      if (res.ok) {
        const data = await res.json();
        setStandardItems(data);
        setShowStandardDropdown(true);
      }
    } catch {
      toast.error("Standard-Positionen konnten nicht geladen werden");
    } finally {
      setStandardLoading(false);
    }
  }

  function addStandardItem(si: StandardLineItem) {
    setItems((prev) => [
      ...prev,
      {
        title: si.title,
        description: si.description ?? "",
        quantity: 1,
        unitPrice: si.unitPrice,
      },
    ]);
    setShowStandardDropdown(false);
  }

  // ---------------------------------------------------------------------------
  // Line item helpers
  // ---------------------------------------------------------------------------

  function addItem() {
    setItems((prev) => [
      ...prev,
      { title: "", description: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  // ---------------------------------------------------------------------------
  // Totals
  // ---------------------------------------------------------------------------

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    [items]
  );

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!companyId) {
      toast.error("Bitte eine Firma auswählen");
      return;
    }
    if (!recipientName.trim()) {
      toast.error("Bitte einen Empfängernamen angeben");
      return;
    }
    if (!dueDate) {
      toast.error("Bitte ein Fälligkeitsdatum angeben");
      return;
    }
    if (items.length === 0 || items.some((i) => !i.title.trim())) {
      toast.error("Alle Positionen müssen einen Titel haben");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/accounting/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          orderId: selectedOrderId || undefined,
          recipientName: recipientName.trim(),
          recipientAddress: recipientAddress.trim() || undefined,
          recipientEmail: recipientEmail.trim() || undefined,
          dueDate,
          deliveryDate: deliveryDate || undefined,
          notes: notes.trim() || undefined,
          items: items.map((item) => ({
            title: item.title,
            description: item.description || undefined,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Erstellen der Rechnung");
      }

      toast.success("Rechnung erfolgreich erstellt");
      router.push("/accounting/invoices");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 sm:pb-8">
      {/* ------------------------------------------------------------------ */}
      {/* Company & Order */}
      {/* ------------------------------------------------------------------ */}
      <div className={cardClass}>
        <h2 className={sectionTitle}>Firma &amp; Auftrag</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Company */}
          <div>
            <label className={labelClass}>Firma *</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className={selectClass}
              required
            >
              <option value="" className="bg-muted text-muted-foreground">
                Firma auswählen...
              </option>
              {companies.map((c) => (
                <option key={c.id} value={c.id} className="bg-muted text-foreground">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Order link */}
          <div>
            <label className={labelClass}>Verknüpfter Auftrag</label>
            <select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className={selectClass}
            >
              <option value="" className="bg-muted text-muted-foreground">
                Kein Auftrag (eigenständig)
              </option>
              {orders.map((order) => (
                <option
                  key={order.id}
                  value={order.id}
                  className="bg-muted text-foreground"
                  disabled={order.hasInvoice}
                >
                  #{order.orderNumber} &ndash; {order.customerName} ({formatEUR(order.price)})
                  {order.hasInvoice ? " [bereits erstellt]" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Customer search & Recipient */}
      {/* ------------------------------------------------------------------ */}
      <div className={cardClass}>
        <h2 className={sectionTitle}>Empfänger</h2>

        {/* Customer search */}
        <div ref={customerRef} className="relative">
          <label className={labelClass}>Kundensuche</label>
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              value={customerQuery}
              onChange={(e) => handleCustomerInput(e.target.value)}
              onFocus={() => {
                if (customerResults.length > 0) setShowCustomerDropdown(true);
              }}
              placeholder="Kunde suchen..."
              className={inputClass + " pl-9"}
            />
            {customerLoading && (
              <IconLoader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground/70" />
            )}
          </div>
          {showCustomerDropdown && customerResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-muted shadow-xl overflow-hidden">
              {customerResults.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCustomer(c)}
                  className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.05]"
                >
                  <span className="text-sm text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground/70">
                    {c.email}
                    {c.company ? ` · ${c.company}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Recipient name */}
          <div>
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Max Mustermann"
              className={inputClass}
              required
            />
          </div>

          {/* Recipient email */}
          <div>
            <label className={labelClass}>E-Mail</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="max@example.com"
              className={inputClass}
            />
          </div>
        </div>

        {/* Recipient address */}
        <div>
          <label className={labelClass}>Adresse</label>
          <textarea
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            rows={2}
            placeholder="Straße, PLZ Ort"
            className={inputClass + " h-auto py-2 resize-none"}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Dates */}
      {/* ------------------------------------------------------------------ */}
      <div className={cardClass}>
        <h2 className={sectionTitle}>Datum</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Fällig am *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass + " [color-scheme:dark]"}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Lieferdatum</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className={inputClass + " [color-scheme:dark]"}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Line Items */}
      {/* ------------------------------------------------------------------ */}
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className={sectionTitle}>Positionen</h2>
          <div className="flex items-center gap-2">
            {/* Standard item button */}
            <div ref={standardRef} className="relative">
              <button
                type="button"
                onClick={loadStandardItems}
                disabled={standardLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-border"
              >
                {standardLoading ? (
                  <IconLoader2 className="size-3.5 animate-spin" />
                ) : (
                  <IconPlus className="size-3.5" />
                )}
                Standard-Position
              </button>
              {showStandardDropdown && standardItems.length > 0 && (
                <div className="absolute right-0 z-50 mt-1 w-72 rounded-lg border border-border bg-muted shadow-xl overflow-hidden">
                  {standardItems.map((si) => (
                    <button
                      key={si.id}
                      type="button"
                      onClick={() => addStandardItem(si)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.05]"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-foreground">{si.title}</div>
                        {si.description && (
                          <div className="truncate text-xs text-muted-foreground/70">{si.description}</div>
                        )}
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatEUR(si.unitPrice)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add item button */}
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-border"
            >
              <IconPlus className="size-3.5" />
              Position hinzufügen
            </button>
          </div>
        </div>

        {/* Item list */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative rounded-lg border border-border bg-muted/50 p-3 sm:p-4 space-y-3 transition-colors"
            >
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="absolute right-2 top-2 flex items-center justify-center size-7 rounded-md text-muted-foreground/70 transition-colors hover:text-red-400 hover:bg-red-500/10"
              >
                <IconX className="size-4" />
              </button>

              {/* Row 1: Title + quantity + unit price + total */}
              <div className="grid gap-3 sm:grid-cols-[1fr_80px_120px_100px] pr-8">
                <div>
                  <label className={labelClass}>Titel *</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    placeholder="Positionsbezeichnung"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Menge</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", parseInt(e.target.value) || 1)
                    }
                    className={inputClass + " tabular-nums text-center"}
                  />
                </div>
                <div>
                  <label className={labelClass}>Einzelpreis</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice || ""}
                    onChange={(e) =>
                      updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0,00"
                    className={inputClass + " tabular-nums text-right"}
                  />
                </div>
                <div>
                  <label className={labelClass}>Gesamt</label>
                  <div className="flex h-9 items-center justify-end rounded-lg border border-border/40 bg-foreground/[0.02] px-3 text-sm font-medium tabular-nums text-foreground/80">
                    {formatEUR(item.quantity * item.unitPrice)}
                  </div>
                </div>
              </div>

              {/* Row 2: Description */}
              <div>
                <label className={labelClass}>Beschreibung</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="Optionale Beschreibung..."
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Totals */}
      {/* ------------------------------------------------------------------ */}
      <div className={cardClass}>
        <h2 className={sectionTitle}>Zusammenfassung</h2>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-semibold text-foreground/80">Gesamtbetrag</span>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {formatEUR(total)}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Notes */}
      {/* ------------------------------------------------------------------ */}
      <div className={cardClass}>
        <h2 className={sectionTitle}>Anmerkungen</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Interne oder externe Anmerkungen zur Rechnung..."
          className={inputClass + " h-auto py-2 resize-none"}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Desktop Save */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden sm:flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => router.push("/accounting/invoices")}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? "Wird erstellt..." : "Rechnung erstellen"}
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile floating save button */}
      {/* ------------------------------------------------------------------ */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm p-4 sm:hidden">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? "Wird erstellt..." : "Rechnung erstellen"}
        </button>
      </div>
    </form>
  );
}
