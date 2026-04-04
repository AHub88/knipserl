"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconPlus,
  IconTrash,
  IconLoader2,
  IconSearch,
  IconArrowLeft,
  IconCheck,
  IconChevronDown,
  IconDotsVertical,
} from "@tabler/icons-react";

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

type Unit = "Stunden" | "Pauschal" | "Stück";

type LineItem = {
  title: string;
  description: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
  optional: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEUR(amount: number) {
  return amount.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function defaultValidUntil() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Shared classes
// ---------------------------------------------------------------------------

const labelClass =
  "text-[10px] font-semibold text-gray-400 uppercase tracking-wide";

const docInputClass =
  "w-full border-0 border-b border-gray-200 bg-transparent px-0 py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-300 focus:border-[#F6A11C] focus:ring-0 transition-colors";

const docSelectClass =
  "w-full border-0 border-b border-gray-200 bg-transparent px-0 py-1.5 text-sm text-gray-900 outline-none focus:border-[#F6A11C] focus:ring-0 transition-colors appearance-none cursor-pointer";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuoteForm({ companies, orders }: Props) {
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

  // Order link
  const [selectedOrderId, setSelectedOrderId] = useState("");

  // Dates
  const [quoteDate, setQuoteDate] = useState(todayISO());
  const [validUntil, setValidUntil] = useState(defaultValidUntil());

  // Title & texts
  const [title, setTitle] = useState("");
  const [introduction, setIntroduction] = useState(
    "Vielen Dank für Ihre Anfrage. Gerne unterbreiten wir Ihnen folgendes Angebot:"
  );
  const [paymentTerms, setPaymentTerms] = useState("");
  const [closingText, setClosingText] = useState(
    "Wir freuen uns auf Ihre Rückmeldung!"
  );

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    {
      title: "",
      description: "",
      quantity: 1,
      unit: "Pauschal",
      unitPrice: 0,
      optional: false,
    },
  ]);

  // Standard line items
  const [standardItems, setStandardItems] = useState<StandardLineItem[]>([]);
  const [standardLoading, setStandardLoading] = useState(false);

  // Add menu
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Row menu
  const [openRowMenu, setOpenRowMenu] = useState<number | null>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);

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
      const res = await fetch(
        `/api/customers/search?q=${encodeURIComponent(q)}`
      );
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
    setRecipientName(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchCustomers(value), 300);
  }

  function selectCustomer(c: CustomerResult) {
    setRecipientName(c.name);
    setCustomerQuery(c.name);
    setShowCustomerDropdown(false);
  }

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        customerRef.current &&
        !customerRef.current.contains(e.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(e.target as Node)
      ) {
        setShowAddMenu(false);
      }
      if (
        rowMenuRef.current &&
        !rowMenuRef.current.contains(e.target as Node)
      ) {
        setOpenRowMenu(null);
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
    }
  }

  // ---------------------------------------------------------------------------
  // Standard line items
  // ---------------------------------------------------------------------------

  async function loadAndAddStandardItem() {
    if (standardItems.length > 0) {
      // Already loaded — show in add menu handled by caller
      return standardItems;
    }
    setStandardLoading(true);
    try {
      const res = await fetch("/api/standard-line-items");
      if (res.ok) {
        const data = await res.json();
        setStandardItems(data);
        return data as StandardLineItem[];
      }
    } catch {
      toast.error("Standard-Positionen konnten nicht geladen werden");
    } finally {
      setStandardLoading(false);
    }
    return [];
  }

  function addStandardItem(si: StandardLineItem) {
    setItems((prev) => [
      ...prev,
      {
        title: si.title,
        description: si.description ?? "",
        quantity: 1,
        unit: "Pauschal" as Unit,
        unitPrice: si.unitPrice,
        optional: false,
      },
    ]);
  }

  // Standard items submenu
  const [showStandardSubmenu, setShowStandardSubmenu] = useState(false);

  // ---------------------------------------------------------------------------
  // Line item helpers
  // ---------------------------------------------------------------------------

  function addItem(optional = false) {
    setItems((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        quantity: 1,
        unit: "Pauschal" as Unit,
        unitPrice: 0,
        optional,
      },
    ]);
    setShowAddMenu(false);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setOpenRowMenu(null);
  }

  function updateItem(
    index: number,
    field: keyof LineItem,
    value: string | number | boolean
  ) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  // ---------------------------------------------------------------------------
  // Totals
  // ---------------------------------------------------------------------------

  const subtotal = useMemo(
    () =>
      items
        .filter((i) => !i.optional)
        .reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
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
    if (!validUntil) {
      toast.error("Bitte ein Gültigkeitsdatum angeben");
      return;
    }
    if (items.length === 0 || items.some((i) => !i.title.trim())) {
      toast.error("Alle Positionen müssen einen Titel haben");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/accounting/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          orderId: selectedOrderId || undefined,
          recipientName: recipientName.trim(),
          validUntil,
          notes: notes.trim() || undefined,
          items: items.map((item) => ({
            title: item.title,
            description: item.description || undefined,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            optional: item.optional,
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-[#f0f1f3]">
      {/* ================================================================== */}
      {/* TOP BAR - sticky */}
      {/* ================================================================== */}
      <div className="sticky top-0 z-50 bg-[#2b2d31] shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/accounting/quotes")}
              className="flex items-center gap-1.5 text-sm text-gray-300 transition-colors hover:text-white"
            >
              <IconArrowLeft className="size-4" />
              <span className="hidden sm:inline">Zurück</span>
            </button>
            <div className="hidden h-5 w-px bg-gray-600 sm:block" />
            <h1 className="text-sm font-semibold text-white sm:text-base">
              Neues Angebot
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/accounting/quotes")}
              className="rounded-md border border-gray-500 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-gray-400 hover:text-white sm:text-sm"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#F6A11C] px-4 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#e5950f] disabled:opacity-50 sm:text-sm"
            >
              {submitting ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconCheck className="size-4" />
              )}
              {submitting ? "Speichern..." : "Speichern"}
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* DOCUMENT AREA */}
      {/* ================================================================== */}
      <div className="mx-auto max-w-4xl px-0 py-6 sm:px-6 sm:py-10">
        <div className="bg-white shadow-xl sm:rounded-lg">
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {/* -------------------------------------------------------------- */}
            {/* Company & Order (small selects) */}
            {/* -------------------------------------------------------------- */}
            <div className="mb-8 flex flex-col gap-3 border-b border-gray-100 pb-6 sm:flex-row sm:gap-6">
              <div className="flex-1">
                <label className={labelClass}>Firma</label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className={docSelectClass + " mt-1"}
                  required
                >
                  <option value="">Firma auswählen...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className={labelClass}>Verknüpfter Auftrag</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  className={docSelectClass + " mt-1"}
                >
                  <option value="">Kein Auftrag</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      #{order.orderNumber} – {order.customerName} (
                      {formatEUR(order.price)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Header Row: Customer + Info block */}
            {/* -------------------------------------------------------------- */}
            <div className="mb-8 grid gap-8 sm:grid-cols-2">
              {/* Left: Customer */}
              <div>
                <label className={labelClass}>Kunde</label>
                <div ref={customerRef} className="relative mt-1">
                  <div className="relative">
                    <IconSearch className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={customerQuery}
                      onChange={(e) => handleCustomerInput(e.target.value)}
                      onFocus={() => {
                        if (customerResults.length > 0)
                          setShowCustomerDropdown(true);
                      }}
                      placeholder="Kunde suchen..."
                      className={docInputClass + " pl-6"}
                    />
                    {customerLoading && (
                      <IconLoader2 className="absolute right-0 top-1/2 size-4 -translate-y-1/2 animate-spin text-gray-400" />
                    )}
                  </div>
                  {showCustomerDropdown && customerResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                      {customerResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selectCustomer(c)}
                          className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-gray-50"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {c.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {c.email}
                            {c.company ? ` · ${c.company}` : ""}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {recipientName && (
                  <div className="mt-3 text-sm text-gray-700">
                    {recipientName}
                  </div>
                )}
              </div>

              {/* Right: Info block */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={labelClass}>Informationsblock</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs text-gray-500">
                      Angebots-Nr:
                    </span>
                    <span className="text-sm text-gray-400 italic">
                      Wird automatisch vergeben
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs text-gray-500">
                      Angebotsdatum:
                    </span>
                    <input
                      type="date"
                      value={quoteDate}
                      onChange={(e) => setQuoteDate(e.target.value)}
                      className="border-0 border-b border-gray-200 bg-transparent py-1 text-sm text-gray-900 outline-none focus:border-[#F6A11C] focus:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs text-gray-500">
                      Gültig bis:
                    </span>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="border-0 border-b border-gray-200 bg-transparent py-1 text-sm text-gray-900 outline-none focus:border-[#F6A11C] focus:ring-0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Title */}
            {/* -------------------------------------------------------------- */}
            <div className="mb-6">
              <label className={labelClass}>Vorgangstitel</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Fotobox Hochzeit"
                className={
                  docInputClass +
                  " mt-1 text-base font-medium placeholder:text-gray-300"
                }
              />
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Introduction */}
            {/* -------------------------------------------------------------- */}
            <div className="mb-8">
              <label className={labelClass}>Einleitung</label>
              <textarea
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                rows={2}
                className={
                  docInputClass +
                  " mt-1 resize-none border-b border-gray-200"
                }
              />
            </div>

            {/* -------------------------------------------------------------- */}
            {/* LINE ITEMS TABLE */}
            {/* -------------------------------------------------------------- */}
            <div className="mb-8">
              {/* Table header - desktop */}
              <div className="hidden border-b-2 border-gray-200 pb-2 sm:grid sm:grid-cols-[40px_1fr_70px_90px_100px_60px_100px_36px] sm:gap-2">
                <span className={labelClass}>Pos.</span>
                <span className={labelClass}>Artikel / Leistung</span>
                <span className={labelClass}>Menge</span>
                <span className={labelClass}>Einheit</span>
                <span className={labelClass + " text-right"}>Preis</span>
                <span className={labelClass + " text-right"}>MwSt.</span>
                <span className={labelClass + " text-right"}>Gesamt</span>
                <span />
              </div>

              {/* Item rows */}
              <div className="divide-y divide-gray-100">
                {items.map((item, index) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  const isOptional = item.optional;

                  return (
                    <div
                      key={index}
                      className={
                        "group py-3 transition-colors hover:bg-gray-50/50" +
                        (isOptional ? " opacity-60" : "")
                      }
                    >
                      {/* Desktop layout */}
                      <div className="hidden sm:grid sm:grid-cols-[40px_1fr_70px_90px_100px_60px_100px_36px] sm:items-start sm:gap-2">
                        {/* Position badge */}
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <div
                            className={
                              "flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white " +
                              (isOptional ? "bg-orange-400" : "bg-blue-500")
                            }
                          >
                            {isOptional ? "O" : "M"}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {index + 1}
                          </span>
                        </div>

                        {/* Title + description */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                updateItem(index, "title", e.target.value)
                              }
                              placeholder="Positionsbezeichnung"
                              className="w-full border-0 bg-transparent py-0.5 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-300 focus:ring-0"
                              required
                            />
                            {isOptional && (
                              <span className="shrink-0 rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-600">
                                Optional
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            placeholder="Beschreibung..."
                            className="w-full border-0 bg-transparent py-0 text-xs text-gray-500 outline-none placeholder:text-gray-300 focus:ring-0"
                          />
                        </div>

                        {/* Quantity */}
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full border-0 border-b border-transparent bg-transparent py-0.5 text-center text-sm tabular-nums text-gray-900 outline-none hover:border-gray-200 focus:border-[#F6A11C] focus:ring-0"
                        />

                        {/* Unit */}
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            updateItem(index, "unit", e.target.value)
                          }
                          className="w-full border-0 border-b border-transparent bg-transparent py-0.5 text-sm text-gray-900 outline-none hover:border-gray-200 focus:border-[#F6A11C] focus:ring-0 appearance-none cursor-pointer"
                        >
                          <option value="Stunden">Stunden</option>
                          <option value="Pauschal">Pauschal</option>
                          <option value="Stück">Stück</option>
                        </select>

                        {/* Price */}
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.unitPrice || ""}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0,00"
                          className="w-full border-0 border-b border-transparent bg-transparent py-0.5 text-right text-sm tabular-nums text-gray-900 outline-none hover:border-gray-200 focus:border-[#F6A11C] focus:ring-0"
                        />

                        {/* MwSt */}
                        <span className="py-0.5 text-right text-sm text-gray-400">
                          0%
                        </span>

                        {/* Total */}
                        <span className="py-0.5 text-right text-sm font-semibold tabular-nums text-gray-900">
                          {formatEUR(lineTotal)}
                        </span>

                        {/* Menu */}
                        <div className="relative" ref={openRowMenu === index ? rowMenuRef : undefined}>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenRowMenu(
                                openRowMenu === index ? null : index
                              )
                            }
                            className="flex size-7 items-center justify-center rounded text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
                          >
                            <IconDotsVertical className="size-4" />
                          </button>
                          {openRowMenu === index && (
                            <div className="absolute right-0 z-50 mt-1 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                              >
                                <IconTrash className="size-3.5" />
                                Löschen
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mobile layout */}
                      <div className="space-y-2 sm:hidden">
                        <div className="flex items-start gap-2">
                          <div
                            className={
                              "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white " +
                              (isOptional ? "bg-orange-400" : "bg-blue-500")
                            }
                          >
                            {isOptional ? "O" : "M"}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                  updateItem(index, "title", e.target.value)
                                }
                                placeholder="Positionsbezeichnung"
                                className="w-full border-0 bg-transparent py-0 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-300 focus:ring-0"
                                required
                              />
                              {isOptional && (
                                <span className="shrink-0 rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-600">
                                  Optional
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Beschreibung..."
                              className="w-full border-0 bg-transparent py-0 text-xs text-gray-500 outline-none placeholder:text-gray-300 focus:ring-0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="flex size-7 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-red-500"
                          >
                            <IconTrash className="size-3.5" />
                          </button>
                        </div>
                        <div className="ml-8 flex items-center gap-3">
                          <div className="w-16">
                            <label className="text-[9px] text-gray-400">
                              Menge
                            </label>
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-full border-0 border-b border-gray-200 bg-transparent py-0.5 text-center text-sm tabular-nums text-gray-900 outline-none focus:border-[#F6A11C] focus:ring-0"
                            />
                          </div>
                          <div className="w-20">
                            <label className="text-[9px] text-gray-400">
                              Einheit
                            </label>
                            <select
                              value={item.unit}
                              onChange={(e) =>
                                updateItem(index, "unit", e.target.value)
                              }
                              className="w-full border-0 border-b border-gray-200 bg-transparent py-0.5 text-sm text-gray-900 outline-none focus:border-[#F6A11C] focus:ring-0 appearance-none"
                            >
                              <option value="Stunden">Stunden</option>
                              <option value="Pauschal">Pauschal</option>
                              <option value="Stück">Stück</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="text-[9px] text-gray-400">
                              Preis
                            </label>
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.unitPrice || ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0,00"
                              className="w-full border-0 border-b border-gray-200 bg-transparent py-0.5 text-right text-sm tabular-nums text-gray-900 outline-none focus:border-[#F6A11C] focus:ring-0"
                            />
                          </div>
                          <div className="w-24 text-right">
                            <label className="text-[9px] text-gray-400">
                              Gesamt
                            </label>
                            <div className="py-0.5 text-sm font-semibold tabular-nums text-gray-900">
                              {formatEUR(lineTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add position button */}
              <div className="relative mt-4" ref={addMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
                >
                  <IconPlus className="size-3.5" />
                  Position hinzufügen
                  <IconChevronDown className="size-3" />
                </button>
                {showAddMenu && (
                  <div className="absolute left-0 z-50 mt-1 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => addItem(false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex size-5 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white">
                        M
                      </div>
                      Neue Position
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const loaded = await loadAndAddStandardItem();
                        if (loaded && loaded.length > 0) {
                          setShowStandardSubmenu(true);
                        } else {
                          setShowAddMenu(false);
                        }
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      {standardLoading ? (
                        <IconLoader2 className="size-5 animate-spin text-gray-400" />
                      ) : (
                        <div className="flex size-5 items-center justify-center rounded-full bg-gray-400 text-[9px] font-bold text-white">
                          S
                        </div>
                      )}
                      Standard-Position
                    </button>
                    {showStandardSubmenu &&
                      standardItems.length > 0 &&
                      standardItems.map((si) => (
                        <button
                          key={si.id}
                          type="button"
                          onClick={() => {
                            addStandardItem(si);
                            setShowAddMenu(false);
                            setShowStandardSubmenu(false);
                          }}
                          className="flex w-full items-center justify-between gap-2 border-t border-gray-50 px-3 py-2 pl-10 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50"
                        >
                          <span className="truncate">{si.title}</span>
                          <span className="shrink-0 text-xs tabular-nums text-gray-400">
                            {formatEUR(si.unitPrice)}
                          </span>
                        </button>
                      ))}
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      type="button"
                      onClick={() => addItem(true)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex size-5 items-center justify-center rounded-full bg-orange-400 text-[9px] font-bold text-white">
                        O
                      </div>
                      Optionale Position
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* TOTALS */}
            {/* -------------------------------------------------------------- */}
            <div className="mb-8 flex justify-end">
              <div className="w-full sm:w-72 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Zwischensumme (Netto)
                  </span>
                  <span className="tabular-nums text-gray-700">
                    {formatEUR(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Gemäß §19 UStG
                  </span>
                  <span className="tabular-nums text-gray-400">
                    {formatEUR(0)}
                  </span>
                </div>
                <div className="border-t-2 border-gray-300 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Gesamtbetrag
                    </span>
                    <span className="text-xl font-bold tabular-nums text-[#F6A11C]">
                      {formatEUR(subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* FOOTER FIELDS */}
            {/* -------------------------------------------------------------- */}
            <div className="space-y-5 border-t border-gray-100 pt-6">
              <div>
                <label className={labelClass}>Zahlungsbedingung</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="z.B. Zahlbar innerhalb von 14 Tagen"
                  className={docInputClass + " mt-1"}
                />
              </div>
              <div>
                <label className={labelClass}>Schlusstext</label>
                <textarea
                  value={closingText}
                  onChange={(e) => setClosingText(e.target.value)}
                  rows={2}
                  className={docInputClass + " mt-1 resize-none"}
                />
              </div>
              <div>
                <label className={labelClass}>Anmerkungen (intern)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Interne Notizen..."
                  className={docInputClass + " mt-1 resize-none"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MOBILE STICKY SAVE */}
      {/* ================================================================== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-sm sm:hidden">
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#F6A11C] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#e5950f] disabled:opacity-50"
        >
          {submitting ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconCheck className="size-4" />
          )}
          {submitting ? "Speichern..." : "Speichern"}
        </button>
      </div>
    </form>
  );
}
