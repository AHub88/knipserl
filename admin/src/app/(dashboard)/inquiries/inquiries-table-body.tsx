"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconMapPin } from "@tabler/icons-react";

interface SerializedInquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  customerType: string;
  eventType: string;
  eventDate: string;
  locationName: string;
  distanceKm: number | null;
  status: string;
  createdAt: string;
  hasOrder: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  NEW: {
    label: "Neu",
    className:
      "bg-amber-500/15 text-amber-600 border-amber-500/25 dark:text-amber-400",
  },
  ACCEPTED: {
    label: "Angenommen",
    className:
      "bg-emerald-500/15 text-emerald-600 border-emerald-500/25 dark:text-emerald-400",
  },
  REJECTED: {
    label: "Abgelehnt",
    className:
      "bg-red-500/15 text-red-600 border-red-500/25 dark:text-red-400",
  },
};

/* ── Mobile card list ── */
function MobileInquiryList({
  inquiries,
  onRowClick,
}: {
  inquiries: SerializedInquiry[];
  onRowClick: (id: string) => void;
}) {
  return (
    <div className="divide-y divide-white/[0.10]">
      {inquiries.map((inquiry) => {
        const status = statusConfig[inquiry.status] ?? statusConfig.NEW;
        const d = new Date(inquiry.eventDate);

        return (
          <div
            key={inquiry.id}
            onClick={() => onRowClick(inquiry.id)}
            className="cursor-pointer px-3 py-2.5 transition-colors active:bg-[#1c1d20]"
          >
            <div className="flex gap-2.5 min-w-0">
              {/* Date pill - spans both lines */}
              <div className="shrink-0 flex items-center self-stretch">
                <span className="flex flex-col items-center justify-center rounded-lg bg-white/[0.06] px-2 py-1.5 h-full min-w-[44px]">
                  <span className="text-[11px] font-semibold tabular-nums text-zinc-300 leading-tight">
                    {d.toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                  <span className="text-[10px] tabular-nums text-zinc-500 leading-tight">
                    {d.getFullYear()}
                  </span>
                </span>
              </div>

              {/* Right content - two lines */}
              <div className="flex-1 min-w-0">
                {/* Line 1: Name + Status badge */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="text-sm font-medium text-zinc-200 truncate"
                    title={inquiry.customerName}
                  >
                    {inquiry.customerName}
                  </span>
                  <span className="ml-auto shrink-0">
                    <Badge
                      variant="outline"
                      className={"text-[10px] px-1.5 py-0 " + status.className}
                    >
                      {status.label}
                    </Badge>
                  </span>
                </div>
                {/* Line 2: Location + Event type + Distance */}
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <span
                    className="text-xs text-zinc-500 truncate"
                    title={inquiry.locationName}
                  >
                    {inquiry.locationName || "\u2013"}
                  </span>
                  <span className="text-[10px] text-zinc-600">&middot;</span>
                  <span className="text-xs text-zinc-500 shrink-0">
                    {inquiry.eventType}
                  </span>
                  {inquiry.distanceKm != null && (
                    <span className="ml-auto flex items-center gap-0.5 text-[11px] tabular-nums text-zinc-500 shrink-0">
                      <IconMapPin className="size-3" />
                      {inquiry.distanceKm.toFixed(0)} km
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Exported table component (mobile + desktop) ── */
export function InquiriesTable({
  inquiries,
}: {
  inquiries: SerializedInquiry[];
}) {
  const router = useRouter();

  const handleRowClick = (id: string) => router.push(`/inquiries/${id}`);

  return (
    <div className="rounded-xl border border-white/[0.10] bg-card overflow-hidden">
      {/* Mobile list */}
      <div className="md:hidden">
        <MobileInquiryList
          inquiries={inquiries}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Desktop table */}
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow className="border-b border-white/[0.10] hover:bg-transparent">
            <TableHead className="pl-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Kunde
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Event
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Location
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Datum
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Typ
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="pr-6 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Entfernung
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiries.map((inquiry) => {
            const status =
              statusConfig[inquiry.status] ?? statusConfig.NEW;
            return (
              <TableRow
                key={inquiry.id}
                onClick={() => handleRowClick(inquiry.id)}
                className="cursor-pointer transition-colors hover:bg-[#F6A11C]/5"
              >
                {/* Customer */}
                <TableCell className="pl-6">
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-200">
                      {inquiry.customerName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {inquiry.customerEmail}
                    </span>
                  </div>
                </TableCell>

                {/* Event type */}
                <TableCell>
                  <span className="text-sm text-zinc-300">
                    {inquiry.eventType}
                  </span>
                </TableCell>

                {/* Location */}
                <TableCell>
                  <span className="text-sm text-zinc-300">
                    {inquiry.locationName}
                  </span>
                </TableCell>

                {/* Date */}
                <TableCell>
                  <span className="text-sm tabular-nums text-zinc-300">
                    {new Date(inquiry.eventDate).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </TableCell>

                {/* Customer type */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      inquiry.customerType === "BUSINESS"
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/25 dark:text-blue-400"
                        : "bg-secondary text-secondary-foreground"
                    }
                  >
                    {inquiry.customerType === "BUSINESS" ? "Firma" : "Privat"}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </TableCell>

                {/* Distance */}
                <TableCell className="pr-6 text-right">
                  {inquiry.distanceKm != null ? (
                    <span className="inline-flex items-center gap-1 text-sm tabular-nums text-muted-foreground">
                      <IconMapPin className="size-3.5" />
                      {inquiry.distanceKm.toFixed(1)} km
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">
                      --
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Keep backward-compatible export name
export { InquiriesTable as InquiriesTableBody };
