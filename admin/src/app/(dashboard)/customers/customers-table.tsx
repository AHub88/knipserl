"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconX } from "@tabler/icons-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  customerType: string;
  orderCount: number;
  lastOrderDate: string | null;
};

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }, [customers, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Suche nach Name, E-Mail, Firma, Telefon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/80">
            <IconX className="size-3.5" />
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground/80">
            {filtered.length} von {customers.length} Kunden
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <IconSearch className="size-10 mb-3 text-muted-foreground" />
            <p className="text-sm">Keine Kunden gefunden</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Firma</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">E-Mail</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Telefon</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Typ</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Aufträge</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Letzter Auftrag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => router.push(`/customers/${c.id}`)}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-accent"
                >
                  <TableCell className="font-medium text-foreground max-w-[220px]">
                    <span className="block truncate" title={c.name}>{c.name}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[160px]">
                    {c.company ? (
                      <span className="block truncate" title={c.company}>{c.company}</span>
                    ) : (
                      <span className="text-muted-foreground">–</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[220px]">
                    {c.email ? (
                      <span className="block truncate" title={c.email}>{c.email}</span>
                    ) : (
                      <span className="text-muted-foreground">–</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">{c.phone || <span className="text-muted-foreground">–</span>}</TableCell>
                  <TableCell>
                    <span className={
                      "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold " +
                      (c.customerType === "BUSINESS"
                        ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                        : "bg-blue-500/15 text-blue-400 border border-blue-500/30")
                    }>
                      {c.customerType === "BUSINESS" ? "Geschäftlich" : "Privat"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-foreground/80 tabular-nums">{c.orderCount}</TableCell>
                  <TableCell className="text-muted-foreground text-sm tabular-nums">
                    {c.lastOrderDate
                      ? new Date(c.lastOrderDate).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
                      : <span className="text-muted-foreground">–</span>}
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
