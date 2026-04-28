import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { DriverReportView } from "./driver-report-view";
import { loadDriverBonusPrices } from "@/lib/driver-bonus-loader";

export const dynamic = "force-dynamic";

export default async function DriverReportPage() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") return null;

  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER", active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, initials: true },
  });

  // Aufträge mit mindestens einem Fahrer + setupCost holen.
  // Der Report rechnet auch Zweitfahrer ein (50/50-Split).
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { driverId: { not: null } },
        { secondDriverId: { not: null } },
      ],
      setupCost: { not: null },
    },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      eventDate: true,
      paymentMethod: true,
      price: true,
      setupCost: true,
      locationName: true,
      driverId: true,
      secondDriverId: true,
      extras: true,
      driverBonus: true,
      driver: { select: { id: true, name: true, initials: true } },
      secondDriver: { select: { id: true, name: true, initials: true } },
    },
    orderBy: { eventDate: "desc" },
  });

  // Live-Bonus-Tabelle als Fallback für Alt-Aufträge
  const driverBonusPrices = await loadDriverBonusPrices();

  const serialized = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    eventDate: o.eventDate.toISOString(),
    paymentMethod: o.paymentMethod,
    price: o.price,
    setupCost: o.setupCost!,
    locationName: o.locationName,
    extras: o.extras,
    driverBonus: o.driverBonus as unknown,
    driverId: o.driverId,
    driverName: o.driver?.name ?? null,
    driverInitials: o.driver?.initials ?? null,
    secondDriverId: o.secondDriverId,
    secondDriverName: o.secondDriver?.name ?? null,
    secondDriverInitials: o.secondDriver?.initials ?? null,
  }));

  return (
    <DriverReportView
      drivers={drivers}
      orders={serialized}
      driverBonusPrices={driverBonusPrices}
    />
  );
}
