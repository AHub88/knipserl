"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type IncomingRow = {
  id: string;
  vendor: string;
  invoiceNumber: string | null;
  amount: number;
  category: string | null;
  companyName: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Ausstehend",
    className: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  PAID: {
    label: "Bezahlt",
    className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  OVERDUE: {
    label: "\u00dcberf\u00e4llig",
    className: "bg-red-500/15 text-red-400 border border-red-500/30",
  },
};

const categoryLabels: Record<string, string> = {
  Fahrtkosten: "Fahrtkosten",
  Equipment: "Equipment",
  Marketing: "Marketing",
  Versicherung: "Versicherung",
  "B\u00fcro": "B\u00fcro",
  Sonstiges: "Sonstiges",
};

function formatAmount(amount: number): string {
  return amount.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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

export function IncomingTable({ invoices }: { invoices: IncomingRow[] }) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  async function markAsPaid(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setUpdating(id);
    try {
      const res = await fetch(`/api/accounting/incoming/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Als bezahlt markiert");
      router.refresh();
    } catch {
      toast.error("Fehler beim Aktualisieren");
    } finally {
      setUpdating(null);
    }
  }

  const thClass =
    "text-[11px] font-semibold uppercase tracking-wider text-zinc-500";

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-white/[0.10] hover:bg-transparent">
          <TableHead className={thClass}>Lieferant</TableHead>
          <TableHead className={thClass}>Rechnungsnr</TableHead>
          <TableHead className={`${thClass} text-right`}>Betrag</TableHead>
          <TableHead className={thClass}>Kategorie</TableHead>
          <TableHead className={thClass}>Firma</TableHead>
          <TableHead className={thClass}>Status</TableHead>
          <TableHead className={thClass}>F&auml;llig</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => {
          const status = statusConfig[inv.status] ?? statusConfig.PENDING;

          return (
            <TableRow
              key={inv.id}
              className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] group"
            >
              <TableCell className="font-medium text-zinc-200">
                {inv.vendor}
              </TableCell>
              <TableCell className="font-mono text-xs text-zinc-400">
                {inv.invoiceNumber ?? "\u2014"}
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-zinc-200 tabular-nums">
                {formatAmount(inv.amount)}&nbsp;&euro;
              </TableCell>
              <TableCell className="text-sm text-zinc-400">
                {inv.category
                  ? categoryLabels[inv.category] ?? inv.category
                  : "\u2014"}
              </TableCell>
              <TableCell>{companyTag(inv.companyName)}</TableCell>
              <TableCell>
                {inv.status === "PENDING" || inv.status === "OVERDUE" ? (
                  <button
                    onClick={(e) => markAsPaid(e, inv.id)}
                    disabled={updating === inv.id}
                    title="Klicken um als bezahlt zu markieren"
                    className={
                      "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 " +
                      status.className
                    }
                  >
                    {updating === inv.id ? "..." : status.label}
                  </button>
                ) : (
                  <span
                    className={
                      "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold " +
                      status.className
                    }
                  >
                    {status.label}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-zinc-400 text-sm tabular-nums">
                {inv.dueDate ? formatDate(inv.dueDate) : "\u2014"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
