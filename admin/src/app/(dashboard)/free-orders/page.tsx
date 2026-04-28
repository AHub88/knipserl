import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IconClipboardCheck } from "@tabler/icons-react";
import { OrdersTable } from "../orders/orders-table";

// Freie Aufträge: status = OPEN UND noch kein Fahrer (weder Primary noch Secondary).
// Sichtbar für Fahrer im Driver-Modus + Admins.

export default async function FreeOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: {
      status: "OPEN",
      driverId: null,
      secondDriverId: null,
      // Nur zukünftige + heute (Vergangenheit ist eh nicht mehr "frei zur Auswahl")
      eventDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: { eventDate: "asc" },
    include: {
      driver: { select: { name: true, initials: true } },
      secondDriver: { select: { name: true, initials: true } },
      company: { select: { name: true } },
      inquiry: { select: { distanceKm: true } },
    },
  });

  const serialized = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    eventType: order.eventType,
    eventDate: order.eventDate.toISOString(),
    driverName: null,
    driverInitials: null,
    secondDriverName: null,
    secondDriverInitials: null,
    price: order.price,
    paymentMethod: order.paymentMethod,
    companyName: order.company.name,
    locationName: order.locationName,
    locationAddress: order.locationAddress,
    distanceKm: order.inquiry?.distanceKm ?? null,
    confirmed: order.confirmed,
    designReady: order.designReady,
    planned: order.planned,
    paid: order.paid,
  }));

  const eventTypes = [
    ...new Set(orders.map((o) => o.eventType).filter(Boolean)),
  ].sort();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <IconClipboardCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Freie Aufträge
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {orders.length} offen · noch kein Fahrer zugewiesen
            </p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 text-muted-foreground">
          <IconClipboardCheck className="size-10 mb-3 text-emerald-500/60" />
          <p className="text-sm font-medium text-foreground">Aktuell keine freien Aufträge</p>
          <p className="text-xs mt-1">
            Alle anstehenden Aufträge haben bereits einen Fahrer.
          </p>
        </div>
      ) : (
        <OrdersTable
          orders={serialized}
          drivers={[]}
          eventTypes={eventTypes}
        />
      )}
    </div>
  );
}
