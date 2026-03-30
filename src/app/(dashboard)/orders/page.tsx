import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
  OPEN: { label: "Offen", variant: "default" },
  ASSIGNED: { label: "Zugewiesen", variant: "secondary" },
  COMPLETED: { label: "Abgeschlossen", variant: "outline" },
  CANCELLED: { label: "Storniert", variant: "destructive" },
};

export default async function OrdersPage() {
  const session = await auth();
  const isAccountingAdmin = session?.user?.role === "ADMIN_ACCOUNTING";

  const orders = await prisma.order.findMany({
    where: isAccountingAdmin ? { paymentMethod: "INVOICE" } : {},
    orderBy: { eventDate: "desc" },
    include: { driver: true, company: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Aufträge</h1>
        <p className="text-muted-foreground">Alle Aufträge verwalten</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Aufträge ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Noch keine Aufträge vorhanden
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Fahrer</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead>Zahlart</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const status = statusMap[order.status] ?? statusMap.OPEN;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.customerName}
                      </TableCell>
                      <TableCell>{order.eventType}</TableCell>
                      <TableCell>
                        {new Date(order.eventDate).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell>
                        {order.driver?.name ?? (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>
                      <TableCell>{order.price.toFixed(2)} €</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.paymentMethod === "CASH" ? "Bar" : "Rechnung"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {order.company.name.includes("GbR") ? "GbR" : "EU"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/orders/${order.id}`}
                          className={buttonVariants({ variant: "ghost", size: "icon" })}
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
