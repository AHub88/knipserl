import Link from "next/link";
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
import { IconEye } from "@tabler/icons-react";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  NEW: { label: "Neu", variant: "default" },
  ACCEPTED: { label: "Angenommen", variant: "secondary" },
  REJECTED: { label: "Abgelehnt", variant: "destructive" },
};

export default async function InquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Anfragen</h1>
          <p className="text-muted-foreground">Alle eingehenden Anfragen verwalten</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Anfragen ({inquiries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Noch keine Anfragen vorhanden
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => {
                  const status = statusMap[inquiry.status] ?? statusMap.NEW;
                  return (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">
                        {inquiry.customerName}
                      </TableCell>
                      <TableCell>{inquiry.eventType}</TableCell>
                      <TableCell>{inquiry.locationName}</TableCell>
                      <TableCell>
                        {new Date(inquiry.eventDate).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {inquiry.customerType === "BUSINESS" ? "Firma" : "Privat"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/inquiries/${inquiry.id}`}
                          className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors"
                        >
                          <IconEye className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
