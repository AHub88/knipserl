import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { IconPackage } from "@tabler/icons-react";
import { MyOrdersTabs } from "@/app/(dashboard)/my-orders/my-orders-tabs";

export const dynamic = "force-dynamic";

export default async function DriverMyOrdersPage() {
  const session = await auth();
  const driverId = session!.user.id;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const [upcomingOrders, pastOrders] = await Promise.all([
    prisma.order.findMany({
      where: { driverId, status: { not: "CANCELLED" }, eventDate: { gte: now } },
      orderBy: { eventDate: "asc" },
    }),
    prisma.order.findMany({
      where: { driverId, eventDate: { lt: now } },
      orderBy: { eventDate: "desc" },
      take: 15,
    }),
  ]);

  const serialize = (orders: typeof upcomingOrders) =>
    orders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      eventDate: o.eventDate.toISOString(),
      eventType: o.eventType,
      locationName: o.locationName,
      locationAddress: o.locationAddress,
      extras: o.extras,
      notes: o.notes,
      status: o.status,
      compensation: Math.abs(o.setupCost ?? 0),
      setupDate: o.setupDate?.toISOString() ?? null,
      setupTime: o.setupTime ?? null,
      teardownDate: o.teardownDate?.toISOString() ?? null,
      teardownTime: o.teardownTime ?? null,
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0">
          <IconPackage className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Meine Aufträge
          </h1>
          <p className="text-xs text-muted-foreground">
            {upcomingOrders.length} anstehend · {pastOrders.length} erledigt
          </p>
        </div>
      </div>

      <MyOrdersTabs
        assignedOrders={serialize(upcomingOrders)}
        pastOrders={serialize(pastOrders)}
        nowIso={now.toISOString()}
        linkBase="/driver/orders"
      />
    </div>
  );
}
