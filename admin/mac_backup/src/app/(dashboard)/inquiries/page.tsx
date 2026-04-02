import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconInbox,
  IconMapPin,
  IconCalendarEvent,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { InquiriesTableBody } from "./inquiries-table-body";

export default async function InquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });

  const countByStatus = {
    total: inquiries.length,
    new: inquiries.filter((i) => i.status === "NEW").length,
    accepted: inquiries.filter((i) => i.status === "ACCEPTED").length,
    rejected: inquiries.filter((i) => i.status === "REJECTED").length,
  };

  // Serialize dates for the client component
  const serializedInquiries = inquiries.map((inquiry) => ({
    id: inquiry.id,
    customerName: inquiry.customerName,
    customerEmail: inquiry.customerEmail,
    customerType: inquiry.customerType,
    eventType: inquiry.eventType,
    eventDate: inquiry.eventDate.toISOString(),
    locationName: inquiry.locationName,
    distanceKm: inquiry.distanceKm,
    status: inquiry.status,
    createdAt: inquiry.createdAt.toISOString(),
    hasOrder: !!inquiry.order,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anfragen</h1>
          <p className="mt-1 text-muted-foreground">
            Alle eingehenden Anfragen verwalten
          </p>
        </div>
        <Link href="/inquiries/new" className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 transition-colors">
          <IconPlus className="size-4" />
          Neue Anfrage
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#F6A11C]/15">
              <IconInbox className="size-5 text-[#F6A11C]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{countByStatus.total}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
              <IconCalendarEvent className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{countByStatus.new}</p>
              <p className="text-xs text-muted-foreground">Neu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
              <IconMapPin className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{countByStatus.accepted}</p>
              <p className="text-xs text-muted-foreground">Angenommen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
              <IconInbox className="size-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{countByStatus.rejected}</p>
              <p className="text-xs text-muted-foreground">Abgelehnt</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            Alle Anfragen
            <Badge variant="secondary" className="ml-3 tabular-nums">
              {inquiries.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {inquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-4">
                <IconInbox className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Noch keine Anfragen</p>
              <p className="text-xs text-muted-foreground mt-1">
                Neue Anfragen erscheinen hier automatisch.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Kunde</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Entfernung</TableHead>
                </TableRow>
              </TableHeader>
              <InquiriesTableBody inquiries={serializedInquiries} />
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
