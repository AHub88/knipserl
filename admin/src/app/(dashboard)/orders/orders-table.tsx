"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconSearch,
  IconFilter,
  IconCalendarMonth,
  IconList,
  IconChevronDown,
  IconChevronRight,
  IconX,
  IconCircleCheck,
  IconCircleX,
  IconPalette,
  IconTruck,
  IconCoin,
  IconAlertTriangle,
  IconPlayerTrackNext,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrderRow = {
  id: string;
  orderNumber: number;
  customerName: string;
  eventType: string;
  eventDate: string;
  driverName: string | null;
  driverInitials: string | null;
  secondDriverName: string | null;
  secondDriverInitials: string | null;
  price: number;
  paymentMethod: string;
  companyName: string;
  locationName: string;
  locationAddress: string;
  distanceKm: number | null;
  confirmed: boolean;
  designReady: boolean;
  planned: boolean;
  paid: boolean;
};

type Props = {
  orders: OrderRow[];
  drivers: string[];
  eventTypes: string[];
};

const paymentConfig: Record<string, { label: string; className: string }> = {
  CASH: {
    label: "Bar",
    className:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  INVOICE: {
    label: "Rechnung",
    className: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
};

const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function companyTag(name: string) {
  const isGbr = name.includes("GbR");
  return (
    <span
      className={
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase " +
        (isGbr
          ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
          : "bg-blue-500/15 text-blue-400 border border-blue-500/30")
      }
    >
      {isGbr ? "GbR" : "EU"}
    </span>
  );
}

/** Extract "Ort" from address like "Straße 1, 83024 Rosenheim" */
function extractOrt(address: string): string {
  const match = address.match(/\d{5}\s+(.+)$/);
  return match ? match[1] : "";
}

/** Split customerName: "Firma - Vorname Nachname" → [firma, name] */
function splitCustomerName(name: string): {
  firma: string;
  kontakt: string;
} {
  const sep = name.indexOf(" - ");
  if (sep >= 0) {
    return { firma: name.slice(0, sep), kontakt: name.slice(sep + 3) };
  }
  return { firma: "", kontakt: name };
}

function StatusIcon({
  done,
  icon: Icon,
  title,
}: {
  done: boolean;
  icon: typeof IconCircleCheck;
  title: string;
}) {
  return (
    <span title={title}>
      <Icon
        className={"size-5 " + (done ? "text-emerald-400" : "text-red-400/60")}
      />
    </span>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#F6A11C]/15 text-[#F6A11C] border border-[#F6A11C]/30 px-2 py-0.5 text-[11px] font-semibold">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-white transition-colors ml-0.5"
      >
        <IconX className="size-3" />
      </button>
    </span>
  );
}

type Tab = "alle" | "offen" | "abgeschlossen" | "unbezahlt";

export function OrdersTable({ orders, drivers, eventTypes }: Props) {
  const router = useRouter();
  const now = new Date();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("alle");

  // Filter state
  const [search, setSearch] = useState("");
  const [confirmedFilter, setConfirmedFilter] = useState("");
  const [designFilter, setDesignFilter] = useState("");
  const [plannedFilter, setPlannedFilter] = useState("");
  const [paidFilter, setPaidFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // View mode
  const [groupByMonth, setGroupByMonth] = useState(false);

  // Filter expanded
  const [showFilters, setShowFilters] = useState(false);

  // Available years from data
  const years = useMemo(() => {
    const yrs = new Set(
      orders.map((o) => new Date(o.eventDate).getFullYear())
    );
    return [...yrs].sort((a, b) => b - a);
  }, [orders]);

  // Tab helpers
  const isComplete = (o: OrderRow) =>
    o.confirmed && o.designReady && o.planned && o.paid;
  const isUnpaid = (o: OrderRow) =>
    !o.paid && new Date(o.eventDate) < now;

  const openCount = orders.filter((o) => !isComplete(o)).length;
  const doneCount = orders.filter((o) => isComplete(o)).length;
  const unpaidCount = orders.filter(isUnpaid).length;

  // Next upcoming order (first future/today order sorted by date)
  const nextOrderId = useMemo(() => {
    const todayStr = now.toISOString().slice(0, 10);
    const upcoming = orders
      .filter((o) => o.eventDate.slice(0, 10) >= todayStr)
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
    return upcoming[0]?.id ?? null;
  }, [orders]);

  const nextOrderRef = useRef<HTMLTableRowElement>(null);

  function scrollToNext() {
    if (nextOrderRef.current) {
      nextOrderRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Filtered orders
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      // Tab filter
      if (activeTab === "offen" && isComplete(o)) return false;
      if (activeTab === "abgeschlossen" && !isComplete(o)) return false;
      if (activeTab === "unbezahlt" && !isUnpaid(o)) return false;

      // Text search
      if (search) {
        const q = search.toLowerCase();
        const { firma, kontakt } = splitCustomerName(o.customerName);
        const ort = extractOrt(o.locationAddress);
        const matches =
          firma.toLowerCase().includes(q) ||
          kontakt.toLowerCase().includes(q) ||
          o.locationName.toLowerCase().includes(q) ||
          ort.toLowerCase().includes(q) ||
          o.eventType.toLowerCase().includes(q) ||
          String(o.orderNumber).includes(q) ||
          (o.driverName && o.driverName.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Status filters
      if (confirmedFilter) {
        if (confirmedFilter === "ja" && !o.confirmed) return false;
        if (confirmedFilter === "nein" && o.confirmed) return false;
      }
      if (designFilter) {
        if (designFilter === "ja" && !o.designReady) return false;
        if (designFilter === "nein" && o.designReady) return false;
      }
      if (plannedFilter) {
        if (plannedFilter === "ja" && !o.planned) return false;
        if (plannedFilter === "nein" && o.planned) return false;
      }
      if (paidFilter) {
        if (paidFilter === "ja" && !o.paid) return false;
        if (paidFilter === "nein" && o.paid) return false;
      }

      // Other filters
      if (paymentFilter && o.paymentMethod !== paymentFilter) return false;
      if (driverFilter) {
        if (driverFilter === "__none__") {
          if (o.driverName) return false;
        } else if (o.driverName !== driverFilter) return false;
      }
      if (eventTypeFilter && o.eventType !== eventTypeFilter) return false;
      if (companyFilter) {
        const isGbr = o.companyName.includes("GbR");
        if (companyFilter === "GBR" && !isGbr) return false;
        if (companyFilter === "EU" && isGbr) return false;
      }

      // Date filters
      const d = new Date(o.eventDate);
      if (yearFilter && d.getFullYear() !== Number(yearFilter)) return false;
      if (monthFilter && d.getMonth() !== Number(monthFilter)) return false;

      return true;
    });
  }, [
    orders,
    activeTab,
    search,
    confirmedFilter,
    designFilter,
    plannedFilter,
    paidFilter,
    paymentFilter,
    driverFilter,
    eventTypeFilter,
    companyFilter,
    yearFilter,
    monthFilter,
  ]);

  // Group by month
  const grouped = useMemo(() => {
    if (!groupByMonth) return null;

    const groups: Record<string, { label: string; orders: OrderRow[] }> = {};
    for (const o of filtered) {
      const d = new Date(o.eventDate);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (!groups[key]) {
        groups[key] = {
          label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
          orders: [],
        };
      }
      groups[key].orders.push(o);
    }

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered, groupByMonth]);

  // Stats for filtered results
  const totalRevenue = filtered.reduce((s, o) => s + o.price, 0);

  // Active filter count
  const activeFilterCount = [
    confirmedFilter,
    designFilter,
    plannedFilter,
    paidFilter,
    paymentFilter,
    driverFilter,
    eventTypeFilter,
    companyFilter,
    yearFilter,
    monthFilter,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setConfirmedFilter("");
    setDesignFilter("");
    setPlannedFilter("");
    setPaidFilter("");
    setPaymentFilter("");
    setDriverFilter("");
    setEventTypeFilter("");
    setCompanyFilter("");
    setYearFilter("");
    setMonthFilter("");
    setSearch("");
  };

  const yesNoOptions = [
    { value: "ja", label: "Ja" },
    { value: "nein", label: "Nein" },
  ];

  const tabs: { key: Tab; label: string; count: number; warn?: boolean }[] = [
    { key: "alle", label: "Alle", count: orders.length },
    { key: "offen", label: "Offen", count: openCount },
    { key: "abgeschlossen", label: "Abgeschlossen", count: doneCount },
    { key: "unbezahlt", label: "Unbezahlt", count: unpaidCount, warn: true },
  ];

  return (
    <div className="space-y-4">
      {/* Search bar + actions */}
      <div className="space-y-2">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Suche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <IconX className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Next order button */}
          {nextOrderId && (
            <button
              onClick={scrollToNext}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <IconPlayerTrackNext className="size-3.5" />
              <span className="hidden sm:inline">Nächster Auftrag</span>
              <span className="sm:hidden">Nächster</span>
            </button>
          )}

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={
              "flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors " +
              (showFilters || activeFilterCount > 0
                ? "border-[#F6A11C]/40 bg-[#F6A11C]/10 text-[#F6A11C]"
                : "border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-zinc-200")
            }
          >
            <IconFilter className="size-3.5" />
            Filter
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center size-4 rounded-full bg-[#F6A11C] text-[10px] font-bold text-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Group by month toggle */}
          <button
            onClick={() => setGroupByMonth(!groupByMonth)}
            className={
              "flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors " +
              (groupByMonth
                ? "border-[#F6A11C]/40 bg-[#F6A11C]/10 text-[#F6A11C]"
                : "border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-zinc-200")
            }
          >
            {groupByMonth ? (
              <IconCalendarMonth className="size-3.5" />
            ) : (
              <IconList className="size-3.5" />
            )}
            <span className="hidden sm:inline">{groupByMonth ? "Nach Monat" : "Liste"}</span>
          </button>
        </div>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-3">
          <FilterSelect
            label="Bestätigt"
            value={confirmedFilter}
            onChange={setConfirmedFilter}
            options={yesNoOptions}
          />
          <FilterSelect
            label="Design"
            value={designFilter}
            onChange={setDesignFilter}
            options={yesNoOptions}
          />
          <FilterSelect
            label="Geplant"
            value={plannedFilter}
            onChange={setPlannedFilter}
            options={yesNoOptions}
          />
          <FilterSelect
            label="Bezahlt"
            value={paidFilter}
            onChange={setPaidFilter}
            options={yesNoOptions}
          />
          <span className="w-px h-5 bg-white/[0.08]" />
          <FilterSelect
            label="Zahlart"
            value={paymentFilter}
            onChange={setPaymentFilter}
            options={[
              { value: "CASH", label: "Bar" },
              { value: "INVOICE", label: "Rechnung" },
            ]}
          />
          <FilterSelect
            label="Fahrer"
            value={driverFilter}
            onChange={setDriverFilter}
            options={[
              { value: "__none__", label: "Kein Fahrer" },
              ...drivers.map((d) => ({ value: d, label: d })),
            ]}
          />
          <FilterSelect
            label="Eventtyp"
            value={eventTypeFilter}
            onChange={setEventTypeFilter}
            options={eventTypes.map((e) => ({ value: e, label: e }))}
          />
          <FilterSelect
            label="Firma"
            value={companyFilter}
            onChange={setCompanyFilter}
            options={[
              { value: "EU", label: "Einzelunternehmen" },
              { value: "GBR", label: "GbR" },
            ]}
          />
          <span className="w-px h-5 bg-white/[0.08]" />
          <FilterSelect
            label="Jahr"
            value={yearFilter}
            onChange={setYearFilter}
            options={years.map((y) => ({
              value: String(y),
              label: String(y),
            }))}
          />
          <FilterSelect
            label="Monat"
            value={monthFilter}
            onChange={setMonthFilter}
            options={MONTH_NAMES.map((m, i) => ({
              value: String(i),
              label: m,
            }))}
          />

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 h-7 px-2.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <IconX className="size-3" />
              Alle zurücksetzen
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {confirmedFilter && (
            <FilterChip
              label={`Bestätigt: ${confirmedFilter === "ja" ? "Ja" : "Nein"}`}
              onRemove={() => setConfirmedFilter("")}
            />
          )}
          {designFilter && (
            <FilterChip
              label={`Design: ${designFilter === "ja" ? "Ja" : "Nein"}`}
              onRemove={() => setDesignFilter("")}
            />
          )}
          {plannedFilter && (
            <FilterChip
              label={`Geplant: ${plannedFilter === "ja" ? "Ja" : "Nein"}`}
              onRemove={() => setPlannedFilter("")}
            />
          )}
          {paidFilter && (
            <FilterChip
              label={`Bezahlt: ${paidFilter === "ja" ? "Ja" : "Nein"}`}
              onRemove={() => setPaidFilter("")}
            />
          )}
          {paymentFilter && (
            <FilterChip
              label={paymentConfig[paymentFilter]?.label ?? paymentFilter}
              onRemove={() => setPaymentFilter("")}
            />
          )}
          {driverFilter && (
            <FilterChip
              label={
                driverFilter === "__none__" ? "Kein Fahrer" : driverFilter
              }
              onRemove={() => setDriverFilter("")}
            />
          )}
          {eventTypeFilter && (
            <FilterChip
              label={eventTypeFilter}
              onRemove={() => setEventTypeFilter("")}
            />
          )}
          {companyFilter && (
            <FilterChip
              label={companyFilter === "GBR" ? "GbR" : "Einzelunternehmen"}
              onRemove={() => setCompanyFilter("")}
            />
          )}
          {yearFilter && (
            <FilterChip
              label={yearFilter}
              onRemove={() => setYearFilter("")}
            />
          )}
          {monthFilter && (
            <FilterChip
              label={MONTH_NAMES[Number(monthFilter)]}
              onRemove={() => setMonthFilter("")}
            />
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-zinc-500 hover:text-zinc-300 ml-1 transition-colors"
          >
            Alle löschen
          </button>
        </div>
      )}

      {/* Table card */}
      <div className="rounded-xl border border-white/[0.10] bg-white/[0.04] overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-0 px-6 border-b border-white/[0.10]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                "relative px-4 py-3 text-sm font-medium transition-colors " +
                (activeTab === tab.key
                  ? tab.warn
                    ? "text-red-400"
                    : "text-[#F6A11C]"
                  : "text-zinc-500 hover:text-zinc-300")
              }
            >
              <span className="flex items-center gap-1.5">
                {tab.warn && (
                  <IconAlertTriangle className="size-3.5" />
                )}
                {tab.label}
                <span
                  className={
                    "text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md " +
                    (activeTab === tab.key
                      ? tab.warn
                        ? "bg-red-500/15 text-red-400"
                        : "bg-[#F6A11C]/15 text-[#F6A11C]"
                      : "bg-white/[0.04] text-zinc-500")
                  }
                >
                  {tab.count}
                </span>
              </span>
              {activeTab === tab.key && (
                <span
                  className={
                    "absolute bottom-0 left-4 right-4 h-0.5 rounded-full " +
                    (tab.warn ? "bg-red-400" : "bg-[#F6A11C]")
                  }
                />
              )}
            </button>
          ))}

          {/* Result summary - right aligned */}
          <div className="ml-auto flex items-center gap-4 text-xs text-zinc-500">
            <span>
              {filtered.length} von {orders.length}
            </span>
            <span className="font-mono tabular-nums text-zinc-400">
              {totalRevenue.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
              &nbsp;&euro;
            </span>
          </div>
        </div>

        {/* Table content */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <IconSearch className="size-10 mb-3 text-zinc-400" />
            <p className="text-sm">Keine Aufträge gefunden</p>
            {(search || activeFilterCount > 0) && (
              <button
                onClick={clearAllFilters}
                className="mt-2 text-xs text-[#F6A11C] hover:underline"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : groupByMonth && grouped ? (
          <div className="space-y-4">
            {grouped.map(([key, group]) => (
              <MonthGroup
                key={key}
                label={group.label}
                orders={group.orders}
                onRowClick={(id) => router.push(`/orders/${id}`)}
                nextOrderId={nextOrderId}
                nextOrderRef={nextOrderRef}
              />
            ))}
          </div>
        ) : (
          <OrderTable
            orders={filtered}
            onRowClick={(id) => router.push(`/orders/${id}`)}
            nextOrderId={nextOrderId}
            nextOrderRef={nextOrderRef}
          />
        )}
      </div>
    </div>
  );
}

// Reusable filter select
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        "h-7 rounded-md border px-2 pr-7 text-xs font-medium outline-none cursor-pointer transition-colors appearance-none bg-[length:12px] bg-[right_6px_center] bg-no-repeat " +
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] " +
        (value
          ? "border-[#F6A11C]/40 bg-[#F6A11C]/10 text-[#F6A11C]"
          : "border-white/[0.08] bg-white/[0.03] text-zinc-400")
      }
    >
      <option value="" className="bg-zinc-900 text-zinc-300">
        {label}
      </option>
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          className="bg-zinc-900 text-zinc-300"
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// Month group with collapsible section
function MonthGroup({
  label,
  orders,
  onRowClick,
  nextOrderId,
  nextOrderRef,
}: {
  label: string;
  orders: OrderRow[];
  onRowClick: (id: string) => void;
  nextOrderId?: string | null;
  nextOrderRef?: React.RefObject<HTMLTableRowElement | null>;
}) {
  const hasNext = nextOrderId ? orders.some((o) => o.id === nextOrderId) : false;
  const [collapsed, setCollapsed] = useState(false);
  const revenue = orders.reduce((s, o) => s + o.price, 0);

  return (
    <div className={"rounded-xl border overflow-hidden " + (hasNext ? "border-[#F6A11C]/20" : "border-white/[0.10]")}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
      >
        <div className="flex items-center gap-3">
          {collapsed ? (
            <IconChevronRight className="size-4 text-zinc-500" />
          ) : (
            <IconChevronDown className="size-4 text-zinc-500" />
          )}
          <span className="text-base font-semibold text-zinc-100">{label}</span>
          <span className="text-xs text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-md">
            {orders.length} {orders.length === 1 ? "Auftrag" : "Aufträge"}
          </span>
        </div>
        <span className="font-mono text-sm font-semibold tabular-nums text-zinc-300">
          {revenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
          &nbsp;&euro;
        </span>
      </button>
      {!collapsed && (
        <div className="border-t border-white/[0.10]">
          <OrderTable orders={orders} onRowClick={onRowClick} nextOrderId={nextOrderId} nextOrderRef={nextOrderRef} />
        </div>
      )}
    </div>
  );
}

// Column order:
// 1. Datum  2. Firmenname  3. Name  4. Event  5. Location  6. Ort  7. KM
// 8. Preis  9. Zahlart  10. Firma  11. Fahrer  12. Status-Icons
function OrderTable({
  orders,
  onRowClick,
  nextOrderId,
  nextOrderRef,
}: {
  orders: OrderRow[];
  onRowClick: (id: string) => void;
  nextOrderId?: string | null;
  nextOrderRef?: React.RefObject<HTMLTableRowElement | null>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-white/[0.10] hover:bg-transparent">
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Datum
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hidden lg:table-cell">
            Firmenname
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Name
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hidden md:table-cell">
            Event
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hidden lg:table-cell">
            Location
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hidden xl:table-cell">
            Ort
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right hidden xl:table-cell">
            KM
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">
            Preis
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hidden md:table-cell">
            Zahlart
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hidden lg:table-cell">
            Firma
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hidden sm:table-cell">
            Fahrer
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-center">
            <span className="flex items-center justify-center gap-1.5">
              <IconCircleCheck className="size-4" title="Bestätigt" />
              <IconPalette className="size-4" title="Design" />
              <IconTruck className="size-4" title="Geplant" />
              <IconCoin className="size-4" title="Bezahlt" />
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const payment =
            paymentConfig[order.paymentMethod] ?? paymentConfig.CASH;
          const { firma, kontakt } = splitCustomerName(order.customerName);
          const ort = extractOrt(order.locationAddress);

          const isNext = nextOrderId === order.id;
          const isPast = new Date(order.eventDate) < new Date();

          return (
            <TableRow
              key={order.id}
              ref={isNext ? nextOrderRef : undefined}
              onClick={() => onRowClick(order.id)}
              className={
                "cursor-pointer border-b transition-colors hover:bg-white/[0.03] group " +
                (isNext
                  ? "border-[#F6A11C]/30 bg-[#F6A11C]/8 border-l-2 border-l-[#F6A11C]"
                  : "border-white/[0.04]") +
                (isPast && !isNext ? " opacity-50" : "")
              }
            >
              <TableCell className="text-zinc-400 text-sm tabular-nums">
                {new Date(order.eventDate).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell className="text-zinc-400 text-sm max-w-[140px] hidden lg:table-cell">
                {firma ? (
                  <span className="block truncate" title={firma}>{firma}</span>
                ) : (
                  <span className="text-zinc-500">–</span>
                )}
              </TableCell>
              <TableCell className="font-medium text-zinc-200 max-w-[140px]">
                <span className="block truncate" title={kontakt}>{kontakt}</span>
              </TableCell>
              <TableCell className="text-zinc-400 text-sm hidden md:table-cell">
                {order.eventType}
              </TableCell>
              <TableCell className="text-zinc-400 text-sm max-w-[140px] hidden lg:table-cell">
                <span className="block truncate" title={order.locationName}>{order.locationName}</span>
              </TableCell>
              <TableCell className="text-zinc-400 text-sm max-w-[100px] hidden xl:table-cell">
                {ort ? (
                  <span className="block truncate" title={ort}>{ort}</span>
                ) : (
                  <span className="text-zinc-500">–</span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-zinc-400 tabular-nums hidden xl:table-cell">
                {order.distanceKm != null ? order.distanceKm : (
                  <span className="text-zinc-500">–</span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-zinc-200 tabular-nums">
                {order.price.toFixed(2)}&nbsp;&euro;
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span
                  className={
                    "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold " +
                    payment.className
                  }
                >
                  {payment.label}
                </span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">{companyTag(order.companyName)}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {order.driverName ? (
                  <span
                    className="text-sm font-medium text-zinc-300"
                    title={
                      order.secondDriverName
                        ? `${order.driverName} / ${order.secondDriverName}`
                        : order.driverName
                    }
                  >
                    {order.driverInitials ?? order.driverName}
                    {order.secondDriverInitials && (
                      <span className="text-zinc-500">
                        /{order.secondDriverInitials}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-sm text-zinc-500 italic">–</span>
                )}
              </TableCell>
              <TableCell>
                <span className="flex items-center justify-center gap-1.5">
                  <StatusIcon
                    done={order.confirmed}
                    icon={IconCircleCheck}
                    title={
                      order.confirmed ? "Bestätigt" : "Nicht bestätigt"
                    }
                  />
                  <StatusIcon
                    done={order.designReady}
                    icon={IconPalette}
                    title={
                      order.designReady ? "Design fertig" : "Design offen"
                    }
                  />
                  <StatusIcon
                    done={order.planned}
                    icon={IconTruck}
                    title={order.planned ? "Geplant" : "Nicht geplant"}
                  />
                  <StatusIcon
                    done={order.paid}
                    icon={IconCoin}
                    title={order.paid ? "Bezahlt" : "Nicht bezahlt"}
                  />
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
