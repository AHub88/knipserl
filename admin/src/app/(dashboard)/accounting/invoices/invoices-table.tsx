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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  companyName: string;
  totalAmount: number;
  status: string;
  displayStatus: string;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
};

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Entwurf",
    className:
      "bg-[#2a2f3d]/80 text-zinc-400 border border-zinc-500/30",
  },
  SENT: {
    label: "Versendet",
    className:
      "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  PAID: {
    label: "Bezahlt",
    className:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  OVERDUE: {
    label: "\u00dcberf\u00e4llig",
    className:
      "bg-red-500/15 text-red-400 border border-red-500/30",
  },
  CANCELLED: {
    label: "Storniert",
    className:
      "bg-[#2a2f3d]/80 text-zinc-400 border border-zinc-500/30",
  },
};

// Allowed transitions for inline status change
const statusTransitions: Record<string, string[]> = {
  DRAFT: ["SENT"],
  SENT: ["PAID", "CANCELLED"],
  OVERDUE: ["PAID", "CANCELLED"],
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function InvoicesTable({ invoices }: { invoices: InvoiceRow[] }) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleStatusChange(invoiceId: string, newStatus: string) {
    setUpdating(invoiceId);
    try {
      const res = await fetch(`/api/accounting/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Fehler beim Aktualisieren");
        return;
      }

      toast.success(
        `Status ge\u00e4ndert: ${statusConfig[newStatus]?.label ?? newStatus}`
      );
      router.refresh();
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-white/[0.10] hover:bg-transparent">
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Nummer
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Kunde
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Firma
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
            Betrag
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            F&auml;llig am
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bezahlt am
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => {
          const display =
            statusConfig[invoice.displayStatus] ?? statusConfig.DRAFT;
          const transitions =
            statusTransitions[invoice.displayStatus] ?? [];

          return (
            <TableRow
              key={invoice.id}
              onClick={() =>
                router.push(`/accounting/invoices/${invoice.id}`)
              }
              className="cursor-pointer border-b border-white/[0.10] transition-colors hover:bg-[#1a1d27] group"
            >
              <TableCell className="font-mono text-xs text-zinc-400">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell className="font-medium text-zinc-200">
                {invoice.customerName}
              </TableCell>
              <TableCell>{companyTag(invoice.companyName)}</TableCell>
              <TableCell className="text-right font-mono text-sm text-zinc-200 tabular-nums">
                {formatCurrency(invoice.totalAmount)}
              </TableCell>
              <TableCell>
                {transitions.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="focus:outline-none"
                    >
                      <span
                        className={
                          "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer transition-opacity " +
                          display.className +
                          (updating === invoice.id
                            ? " opacity-50"
                            : " hover:opacity-80")
                        }
                      >
                        {display.label}
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      sideOffset={4}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {transitions.map((nextStatus) => {
                        const cfg = statusConfig[nextStatus];
                        return (
                          <DropdownMenuItem
                            key={nextStatus}
                            onClick={() =>
                              handleStatusChange(invoice.id, nextStatus)
                            }
                          >
                            <span
                              className={
                                "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold " +
                                (cfg?.className ?? "")
                              }
                            >
                              {cfg?.label ?? nextStatus}
                            </span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span
                    className={
                      "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold " +
                      display.className
                    }
                  >
                    {display.label}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-zinc-400 text-sm tabular-nums">
                {formatDate(invoice.dueDate)}
              </TableCell>
              <TableCell className="text-sm tabular-nums">
                {invoice.paidAt ? (
                  <span className="text-emerald-400">
                    {formatDate(invoice.paidAt)}
                  </span>
                ) : (
                  <span className="text-zinc-400 italic">&mdash;</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
