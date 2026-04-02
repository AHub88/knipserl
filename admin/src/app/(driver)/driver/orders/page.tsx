import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ClaimOrderButton } from "./claim-button";
import { IconMapPin, IconCalendar } from "@tabler/icons-react";

export default async function DriverOrdersPage() {
  const session = await auth();
  const driverId = session!.user.id;

  const [myOrders, openOrders] = await Promise.all([
    prisma.order.findMany({
      where: { driverId, status: { in: ["ASSIGNED", "COMPLETED"] } },
      orderBy: { eventDate: "desc" },
    }),
    prisma.order.findMany({
      where: { status: "OPEN" },
      orderBy: { eventDate: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Aufträge</h1>

      <Tabs defaultValue="open">
        <TabsList className="w-full">
          <TabsTrigger value="open" className="flex-1">
            Offen ({openOrders.length})
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex-1">
            Meine ({myOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-3 mt-3">
          {openOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Keine offenen Aufträge
            </p>
          ) : (
            openOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {order.eventType}
                      </Badge>
                    </div>
                    <div className="text-right text-sm font-medium">
                      {order.price.toFixed(0)} €
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
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
                      {order.locationName} · {order.locationAddress}
                    </div>
                  </div>
                  {order.extras.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {order.extras.map((e) => (
                        <Badge key={e} variant="outline" className="text-xs">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <ClaimOrderButton orderId={order.id} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-3 mt-3">
          {myOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Noch keine Aufträge übernommen
            </p>
          ) : (
            myOrders.map((order) => (
              <Link
                key={order.id}
                href={`/driver/orders/${order.id}`}
                className="block"
              >
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {order.eventType}
                          </Badge>
                          <Badge
                            variant={order.status === "COMPLETED" ? "outline" : "default"}
                            className="text-xs"
                          >
                            {order.status === "COMPLETED" ? "Abgeschlossen" : "Zugewiesen"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <IconCalendar className="h-3.5 w-3.5" />
                        {new Date(order.eventDate).toLocaleDateString("de-DE")}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconMapPin className="h-3.5 w-3.5" />
                        {order.locationName}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
