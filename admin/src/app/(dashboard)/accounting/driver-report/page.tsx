import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { DriverReportView } from "./driver-report-view";

export const dynamic = "force-dynamic";

export default async function DriverReportPage() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") return null;

  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER", active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, initials: true },
  });

  // Fetch all orders with setupCost and driver for the report
  const orders = await prisma.order.findMany({
    where: {
      driverId: { not: null },
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
      driver: { select: { id: true, name: true, initials: true } },
    },
    orderBy: { eventDate: "desc" },
  });

  const serialized = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    eventDate: o.eventDate.toISOString(),
    paymentMethod: o.paymentMethod,
    price: o.price,
    setupCost: o.setupCost!,
    locationName: o.locationName,
    driverId: o.driverId!,
    driverName: o.driver?.name ?? "",
    driverInitials: o.driver?.initials ?? "",
  }));

  return (
    <DriverReportView
      drivers={drivers}
      orders={serialized}
    />
  );
}
