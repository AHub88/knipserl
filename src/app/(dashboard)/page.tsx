import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconInbox, IconFileText, IconCash, IconAlertTriangle } from "@tabler/icons-react";

export default async function DashboardPage() {
  const session = await auth();
  const isAccountingAdmin = session?.user?.role === "ADMIN_ACCOUNTING";

  const [newInquiries, openOrders, recentOrders] = await Promise.all([
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.order.count({
      where: {
        status: { in: ["OPEN", "ASSIGNED"] },
        ...(isAccountingAdmin ? { paymentMethod: "INVOICE" } : {}),
      },
    }),
    prisma.order.findMany({
      where: {
        status: { in: ["OPEN", "ASSIGNED"] },
        ...(isAccountingAdmin ? { paymentMethod: "INVOICE" } : {}),
      },
      orderBy: { eventDate: "asc" },
      take: 5,
      include: { driver: true },
    }),
  ]);

  const statusColors: Record<string, string> = {
    OPEN: "bg-yellow-100 text-yellow-800",
    ASSIGNED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Willkommen zurück, {session?.user?.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Neue Anfragen</CardTitle>
            <IconInbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newInquiries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Offene Aufträge</CardTitle>
            <IconFileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Umsatz (Monat)</CardTitle>
            <IconCash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">–</div>
            <p className="text-xs text-muted-foreground">Wird in Phase 3 aktiv</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Warnungen</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">–</div>
            <p className="text-xs text-muted-foreground">Keine offenen Warnungen</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nächste Aufträge</CardTitle>
          <CardDescription>Die nächsten anstehenden Events</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine offenen Aufträge</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.locationName} · {order.eventType} ·{" "}
                      {new Date(order.eventDate).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.driver ? (
                      <span className="text-sm">{order.driver.name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Kein Fahrer</span>
                    )}
                    <Badge
                      variant="secondary"
                      className={statusColors[order.status] ?? ""}
                    >
                      {order.status === "OPEN" ? "Offen" : "Zugewiesen"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
