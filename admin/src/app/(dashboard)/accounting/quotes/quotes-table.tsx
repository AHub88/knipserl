"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type QuoteRow = {
  id: string;
  quoteNumber: string;
  customerName: string;
  companyName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  validUntil: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Entwurf",
    className:
      "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30",
  },
  SENT: {
    label: "Versendet",
    className:
      "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  ACCEPTED: {
    label: "Angenommen",
    className:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  REJECTED: {
    label: "Abgelehnt",
    className:
      "bg-red-500/15 text-red-400 border border-red-500/30",
  },
};

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

function formatEUR(amount: number) {
  return amount.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function QuotesTable({ quotes }: { quotes: QuoteRow[] }) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-white/[0.10] hover:bg-transparent">
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Nummer
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Kunde
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Firma
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">
            Betrag
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Status
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Datum
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotes.map((quote) => {
          const status = statusConfig[quote.status] ?? statusConfig.DRAFT;

          return (
            <TableRow
              key={quote.id}
              onClick={() => alert(`Quote ID: ${quote.id}`)}
              className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-[#F6A11C]/[0.04] group"
            >
              <TableCell className="font-mono text-xs text-zinc-400">
                {quote.quoteNumber}
              </TableCell>
              <TableCell className="font-medium text-zinc-200">
                {quote.customerName}
              </TableCell>
              <TableCell>{companyTag(quote.companyName)}</TableCell>
              <TableCell className="text-right font-mono text-sm text-zinc-200 tabular-nums">
                {formatEUR(quote.totalAmount)}
              </TableCell>
              <TableCell>
                <span
                  className={
                    "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold " +
                    status.className
                  }
                >
                  {status.label}
                </span>
              </TableCell>
              <TableCell className="text-zinc-400 text-sm tabular-nums">
                {formatDate(quote.createdAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
