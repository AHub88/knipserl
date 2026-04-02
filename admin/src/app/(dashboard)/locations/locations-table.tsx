"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  IconSearch,
  IconX,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Location = {
  id: string;
  name: string;
  street: string | null;
  zip: string | null;
  city: string | null;
  distanceKm: number | null;
  customerTravelCost: number | null;
  driverCompensation: number | null;
  usageCount: number;
};

type SortKey =
  | "name"
  | "street"
  | "zip"
  | "city"
  | "distanceKm"
  | "customerTravelCost"
  | "driverCompensation"
  | "usageCount";
type SortDir = "asc" | "desc";

function SortableHead({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = activeKey === sortKey;
  return (
    <TableHead
      className={
        "text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors hover:text-zinc-300 " +
        (active ? "text-[#F6A11C]" : "text-muted-foreground") +
        (className ? " " + className : "")
      }
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          direction === "asc" ? (
            <IconChevronUp className="size-3" />
          ) : (
            <IconChevronDown className="size-3" />
          )
        ) : (
          <IconSelector className="size-3 opacity-40" />
        )}
      </span>
    </TableHead>
  );
}

export function LocationsTable({ locations }: { locations: Location[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("usageCount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "city" || key === "street" || key === "zip" ? "asc" : "desc");
    }
  }

  const filtered = useMemo(() => {
    let result = locations;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.city && l.city.toLowerCase().includes(q)) ||
          (l.street && l.street.toLowerCase().includes(q)) ||
          (l.zip && l.zip.includes(q))
      );
    }
    return result;
  }, [locations, search]);

  const sorted = useMemo(() => {
    const mult = sortDir === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      let av: string | number | null;
      let bv: string | number | null;

      switch (sortKey) {
        case "name":
          av = a.name.toLowerCase();
          bv = b.name.toLowerCase();
          break;
        case "street":
          av = (a.street ?? "").toLowerCase();
          bv = (b.street ?? "").toLowerCase();
          break;
        case "zip":
          av = a.zip ?? "";
          bv = b.zip ?? "";
          break;
        case "city":
          av = (a.city ?? "").toLowerCase();
          bv = (b.city ?? "").toLowerCase();
          break;
        case "distanceKm":
          av = a.distanceKm ?? -1;
          bv = b.distanceKm ?? -1;
          break;
        case "customerTravelCost":
          av = a.customerTravelCost ?? -1;
          bv = b.customerTravelCost ?? -1;
          break;
        case "driverCompensation":
          av = a.driverCompensation ?? -1;
          bv = b.driverCompensation ?? -1;
          break;
        case "usageCount":
          av = a.usageCount;
          bv = b.usageCount;
          break;
      }

      if (av < bv) return -1 * mult;
      if (av > bv) return 1 * mult;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Suche nach Name, Ort, Straße, PLZ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-white/[0.08] bg-card pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-400 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-zinc-300"
          >
            <IconX className="size-3.5" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.10] bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.10] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">
            {sorted.length} von {locations.length} Locations
          </h2>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <IconSearch className="size-10 mb-3 text-zinc-400" />
            <p className="text-sm">Keine Locations gefunden</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/[0.10] hover:bg-transparent">
                <SortableHead label="Name" sortKey="name" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                <SortableHead label="Straße" sortKey="street" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                <SortableHead label="PLZ" sortKey="zip" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                <SortableHead label="Ort" sortKey="city" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                <SortableHead label="KM" sortKey="distanceKm" activeKey={sortKey} direction={sortDir} onSort={handleSort} className="text-right" />
                <SortableHead label="Kunde" sortKey="customerTravelCost" activeKey={sortKey} direction={sortDir} onSort={handleSort} className="text-right" />
                <SortableHead label="Vergütung" sortKey="driverCompensation" activeKey={sortKey} direction={sortDir} onSort={handleSort} className="text-right" />
                <SortableHead label="Aufträge" sortKey="usageCount" activeKey={sortKey} direction={sortDir} onSort={handleSort} className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((loc) => (
                  <TableRow
                    key={loc.id}
                    onClick={() => router.push(`/locations/${loc.id}`)}
                    className="cursor-pointer border-b border-white/[0.10] transition-colors hover:bg-[#1c1d20]"
                  >
                    <TableCell className="font-medium text-zinc-200 max-w-[200px]">
                      <span className="block truncate" title={loc.name}>
                        {loc.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm max-w-[180px]">
                      {loc.street ? (
                        <span className="block truncate" title={loc.street}>
                          {loc.street}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm font-mono tabular-nums">
                      {loc.zip || <span className="text-muted-foreground">–</span>}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm max-w-[120px]">
                      {loc.city ? (
                        <span className="block truncate" title={loc.city}>
                          {loc.city}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-zinc-400 tabular-nums">
                      {loc.distanceKm != null ? (
                        loc.distanceKm
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {loc.customerTravelCost != null ? (
                        <span className="text-zinc-200">
                          {loc.customerTravelCost.toFixed(2)}&nbsp;&euro;
                        </span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {loc.driverCompensation != null ? (
                        <span className="text-amber-400">
                          {loc.driverCompensation.toFixed(2)}&nbsp;&euro;
                        </span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-zinc-400 tabular-nums">
                      {loc.usageCount}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
