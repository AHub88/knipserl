import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { IconMapPin, IconCalendar, IconClock } from "@tabler/icons-react";

export default async function DriverDashboardPage() {
  const session = await auth();
  const driverId = session!.user.id;

  const [myOrders, openOrders, vacations] = await Promise.all([
    prisma.order.findMany({
      where: { driverId, status: "ASSIGNED" },
      orderBy: { eventDate: "asc" },
    }),
    prisma.order.count({ where: { status: "OPEN" } }),
    prisma.vacation.findMany({
      where: {
        driverId,
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Hallo, {session!.user.name}!</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{myOrders.length}</div>
            <p className="text-xs text-muted-foreground">Meine Aufträge</p>
          </CardContent>
        </Card>
        <Link href="/driver/orders">
          <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">{openOrders}</div>
              <p className="text-xs text-muted-foreground">Offene Aufträge</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Meine nächsten Fahrten</CardTitle>
        </CardHeader>
        <CardContent>
          {myOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Keine zugewiesenen Aufträge
            </p>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/driver/orders/${order.id}`}
                  className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="font-medium">{order.customerName}</div>
                    <Badge variant="secondary" className="text-xs">
                      {order.eventType}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <IconCalendar className="h-3.5 w-3.5" />
                      {new Date(order.eventDate).toLocaleDateString("de-DE", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IconMapPin className="h-3.5 w-3.5" />
                      {order.locationName}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {vacations.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Mein Urlaub</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vacations.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <IconClock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {new Date(v.startDate).toLocaleDateString("de-DE")} –{" "}
                    {new Date(v.endDate).toLocaleDateString("de-DE")}
                  </span>
                  {v.note && (
                    <span className="text-muted-foreground">({v.note})</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
