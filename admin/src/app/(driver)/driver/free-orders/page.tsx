import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { IconClipboardCheck } from "@tabler/icons-react";
import { FreeOrdersList } from "@/app/(dashboard)/free-orders/free-orders-list";

export const dynamic = "force-dynamic";

export default async function DriverFreeOrdersPage() {
  await auth();

  const orders = await prisma.order.findMany({
    where: {
      status: "OPEN",
      driverId: null,
      secondDriverId: null,
      eventDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: { eventDate: "asc" },
    include: {
      inquiry: { select: { distanceKm: true } },
    },
  });

  const serialized = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    eventType: order.eventType,
    eventDate: order.eventDate.toISOString(),
    locationName: order.locationName,
    locationAddress: order.locationAddress,
    distanceKm: order.inquiry?.distanceKm ?? null,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
          <IconClipboardCheck className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Freie Aufträge
          </h1>
          <p className="text-xs text-muted-foreground">
            {orders.length} offen · zum Übernehmen
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 text-muted-foreground">
          <IconClipboardCheck className="size-10 mb-3 text-emerald-500/60" />
          <p className="text-sm font-medium text-foreground">
            Aktuell keine freien Aufträge
          </p>
          <p className="text-xs mt-1">Alle anstehenden Aufträge haben bereits einen Fahrer.</p>
        </div>
      ) : (
        <FreeOrdersList orders={serialized} linkBase="/driver/orders" />
      )}
    </div>
  );
}
