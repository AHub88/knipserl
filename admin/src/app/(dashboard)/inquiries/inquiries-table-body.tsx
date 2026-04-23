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
    label: "Offen",
    className:
      "bg-amber-500/15 text-amber-600 border-amber-500/25 dark:text-amber-400",
  },
  CONTACTED: {
    label: "Kontaktiert",
    className:
      "bg-blue-500/15 text-blue-600 border-blue-500/25 dark:text-blue-400",
  },
  WAITING: {
    label: "Warte",
    className:
      "bg-purple-500/15 text-purple-600 border-purple-500/25 dark:text-purple-400",
  },
  ACCEPTED: {
    label: "Zugesagt",
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
    <div className="divide-y divide-border">
      {inquiries.map((inquiry) => {
        const status = statusConfig[inquiry.status] ?? statusConfig.NEW;
        const d = new Date(inquiry.eventDate);

        return (
          <div
            key={inquiry.id}
            onClick={() => onRowClick(inquiry.id)}
            className="cursor-pointer px-3 py-2.5 transition-colors active:bg-accent"
          >
            <div className="flex gap-2.5 min-w-0">
              {/* Date pill - spans both lines */}
              <div className="shrink-0 flex items-center self-stretch">
                <span className="flex flex-col items-center justify-center rounded-lg bg-foreground/[0.06] px-2 py-1.5 h-full min-w-[44px]">
                  <span className="text-[11px] font-semibold tabular-nums text-foreground/80 leading-tight">
                    {d.toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground/70 leading-tight">
                    {d.getFullYear()}
                  </span>
                </span>
              </div>

              {/* Right content - two lines */}
              <div className="flex-1 min-w-0">
                {/* Line 1: Name + Status badge */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="text-sm font-medium text-foreground truncate"
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
                    className="text-xs text-muted-foreground/70 truncate"
                    title={inquiry.locationName}
                  >
                    {inquiry.locationName || "\u2013"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">&middot;</span>
                  <span className="text-xs text-muted-foreground/70 shrink-0">
                    {inquiry.eventType}
                  </span>
                  {inquiry.distanceKm != null && (
                    <span className="ml-auto flex items-center gap-0.5 text-[11px] tabular-nums text-muted-foreground/70 shrink-0">
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
    <div className="rounded-xl border border-border bg-card overflow-x-auto">
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
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="pl-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Datum
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Kunde
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Event
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Location
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
              KM
            </TableHead>
            <TableHead className="pr-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
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
                className="cursor-pointer border-b border-border transition-colors hover:bg-accent"
              >
                {/* Date */}
                <TableCell className="pl-4 text-sm tabular-nums text-muted-foreground">
                  {new Date(inquiry.eventDate).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>

                {/* Customer */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {inquiry.customerName}
                    </span>
                    {inquiry.customerEmail && (
                      <span className="text-xs text-muted-foreground">
                        {inquiry.customerEmail}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Event type */}
                <TableCell>
                  <span className="text-sm text-foreground/80">
                    {inquiry.eventType}
                  </span>
                </TableCell>

                {/* Location */}
                <TableCell>
                  <span className="text-sm text-foreground/80 block max-w-[180px] truncate" title={inquiry.locationName}>
                    {inquiry.locationName || "–"}
                  </span>
                </TableCell>

                {/* Distance */}
                <TableCell className="hidden lg:table-cell">
                  {inquiry.distanceKm != null ? (
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {inquiry.distanceKm.toFixed(0)} km
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">–</span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell className="pr-4">
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
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
