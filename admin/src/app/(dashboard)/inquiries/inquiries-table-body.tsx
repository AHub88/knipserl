"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  TableBody,
  TableCell,
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

export function InquiriesTableBody({
  inquiries,
}: {
  inquiries: SerializedInquiry[];
}) {
  const router = useRouter();

  return (
    <TableBody>
      {inquiries.map((inquiry) => {
        const status = statusConfig[inquiry.status] ?? statusConfig.NEW;
        return (
          <TableRow
            key={inquiry.id}
            onClick={() => router.push(`/inquiries/${inquiry.id}`)}
            className="cursor-pointer transition-colors hover:bg-[#F6A11C]/5"
          >
            {/* Customer */}
            <TableCell className="pl-6">
              <div className="flex flex-col">
                <span className="font-medium">{inquiry.customerName}</span>
                <span className="text-xs text-muted-foreground">
                  {inquiry.customerEmail}
                </span>
              </div>
            </TableCell>

            {/* Event type */}
            <TableCell>
              <span className="text-sm">{inquiry.eventType}</span>
            </TableCell>

            {/* Location */}
            <TableCell>
              <span className="text-sm">{inquiry.locationName}</span>
            </TableCell>

            {/* Date */}
            <TableCell>
              <span className="text-sm tabular-nums">
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
                <span className="text-xs text-muted-foreground/50">--</span>
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
}
