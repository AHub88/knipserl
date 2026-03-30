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

type OrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  eventType: string;
  eventDate: string;
  driverName: string | null;
  price: number;
  paymentMethod: string;
  companyName: string;
  status: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  OPEN: {
    label: "Offen",
    className:
      "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  ASSIGNED: {
    label: "Zugewiesen",
    className:
      "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  COMPLETED: {
    label: "Abgeschlossen",
    className:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  CANCELLED: {
    label: "Storniert",
    className:
      "bg-red-500/15 text-red-400 border border-red-500/30",
  },
};

const paymentConfig: Record<string, { label: string; className: string }> = {
  CASH: {
    label: "Bar",
    className:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  INVOICE: {
    label: "Rechnung",
    className:
      "bg-blue-500/15 text-blue-400 border border-blue-500/30",
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

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            #
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Kunde
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Event
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Datum
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Fahrer
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">
            Preis
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Zahlart
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Firma
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Status
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const status = statusConfig[order.status] ?? statusConfig.OPEN;
          const payment =
            paymentConfig[order.paymentMethod] ?? paymentConfig.CASH;

          return (
            <TableRow
              key={order.id}
              onClick={() => router.push(`/orders/${order.id}`)}
              className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] group"
            >
              <TableCell className="font-mono text-xs text-zinc-400">
                {order.orderNumber}
              </TableCell>
              <TableCell className="font-medium text-zinc-200">
                {order.customerName}
              </TableCell>
              <TableCell className="text-zinc-400 text-sm">
                {order.eventType}
              </TableCell>
              <TableCell className="text-zinc-400 text-sm tabular-nums">
                {new Date(order.eventDate).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                {order.driverName ? (
                  <span className="text-sm text-zinc-300">
                    {order.driverName}
                  </span>
                ) : (
                  <span className="text-sm text-zinc-600 italic">
                    Kein Fahrer
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-zinc-200 tabular-nums">
                {order.price.toFixed(2)}&nbsp;&euro;
              </TableCell>
              <TableCell>
                <span
                  className={
                    "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold " +
                    payment.className
                  }
                >
                  {payment.label}
                </span>
              </TableCell>
              <TableCell>{companyTag(order.companyName)}</TableCell>
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
