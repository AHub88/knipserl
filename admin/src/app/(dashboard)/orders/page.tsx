import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { IconFileText, IconPlus } from "@tabler/icons-react";
import { OrdersTable } from "./orders-table";
import { getPaymentFilter, getEffectiveViewMode } from "@/lib/view-mode";

export default async function OrdersPage() {
  const session = await auth();
  const paymentFilter = await getPaymentFilter(session?.user?.role ?? "");
  const viewMode = await getEffectiveViewMode(session?.user?.role ?? "");

  // Driver view: only orders from last 60 days + future
  const dateFilter = viewMode === "driver"
    ? { eventDate: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } }
    : {};

  const orders = await prisma.order.findMany({
    where: { ...paymentFilter, ...dateFilter },
    orderBy: { eventDate: "desc" },
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
    driverName: order.driver?.name ?? null,
    driverInitials: order.driver?.initials ?? null,
    secondDriverName: order.secondDriver?.name ?? null,
    secondDriverInitials: order.secondDriver?.initials ?? null,
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

  // Unique drivers and event types for filter dropdowns
  const drivers = [
    ...new Set(
      orders
        .map((o) => o.driver?.name)
        .filter((n): n is string => Boolean(n))
    ),
  ].sort();

  const eventTypes = [
    ...new Set(orders.map((o) => o.eventType).filter(Boolean)),
  ].sort();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C] shrink-0">
            <IconFileText className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Auftr&auml;ge
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {orders.length} insgesamt
            </p>
          </div>
        </div>
        <Link
          href="/orders/new"
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 transition-colors"
        >
          <IconPlus className="size-4" />
          Neuer Auftrag
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-white/[0.10] bg-card flex flex-col items-center justify-center py-16 text-muted-foreground">
          <IconFileText className="size-10 mb-3 text-zinc-400" />
          <p className="text-sm">Noch keine Auftr&auml;ge vorhanden</p>
        </div>
      ) : (
        <OrdersTable
          orders={serialized}
          drivers={drivers}
          eventTypes={eventTypes}
        />
      )}
    </div>
  );
}
