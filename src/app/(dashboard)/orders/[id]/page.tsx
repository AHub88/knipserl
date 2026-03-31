import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { OrderDetail } from "./order-detail";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      driver: true,
      secondDriver: true,
      company: true,
      inquiry: true,
    },
  });

  if (!order) notFound();

  if (session?.user?.role === "ADMIN_ACCOUNTING" && order.paymentMethod === "CASH") {
    notFound();
  }

  const drivers = await prisma.user.findMany({
    where: { role: { in: ["DRIVER", "ADMIN"] }, active: true },
    orderBy: { name: "asc" },
  });

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  });

  const locations = await prisma.location.findMany({
    orderBy: { usageCount: "desc" },
  });

  const isAdmin =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "ADMIN_ACCOUNTING";

  const serialized = {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    eventType: order.eventType,
    eventDate: order.eventDate.toISOString(),
    locationName: order.locationName,
    locationAddress: order.locationAddress,
    price: order.price,
    travelCost: order.travelCost,
    boxPrice: order.boxPrice,
    extrasCost: order.extrasCost,
    setupCost: order.setupCost,
    materialCost: order.materialCost,
    discount: order.discount,
    discountType: order.discountType,
    paymentMethod: order.paymentMethod,
    status: order.status,
    driverId: order.driverId,
    driverName: order.driver?.name ?? null,
    secondDriverId: order.secondDriverId,
    secondDriverName: order.secondDriver?.name ?? null,
    companyId: order.companyId,
    companyName: order.company.name,
    extras: order.extras,
    notes: order.notes,
    internalNotes: order.internalNotes,
    confirmed: order.confirmed,
    designReady: order.designReady,
    planned: order.planned,
    paid: order.paid,
    distanceKm: order.inquiry?.distanceKm ?? null,
  };

  return (
    <OrderDetail
      order={serialized}
      drivers={drivers.map((d) => ({ id: d.id, name: d.name, initials: d.initials }))}
      companies={companies.map((c) => ({ id: c.id, name: c.name }))}
      locations={locations.map((l) => ({
        id: l.id,
        name: l.name,
        street: l.street,
        zip: l.zip,
        city: l.city,
        distanceKm: l.distanceKm,
      }))}
      isAdmin={isAdmin}
    />
  );
}
