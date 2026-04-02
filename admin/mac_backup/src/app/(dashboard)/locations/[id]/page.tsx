import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { LocationDetailView } from "./location-detail";
import { calculateTravelPrice } from "@/lib/travel-pricing";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const location = await prisma.location.findUnique({
    where: { id },
  });

  if (!location) notFound();

  const prices =
    location.distanceKm != null
      ? await calculateTravelPrice(location.distanceKm)
      : null;

  const orders = await prisma.order.findMany({
    where: { locationName: location.name },
    orderBy: { eventDate: "desc" },
    include: { driver: true },
  });

  const serializedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    eventType: o.eventType,
    eventDate: o.eventDate.toISOString(),
    driverName: o.driver?.name ?? null,
    driverInitials: o.driver?.initials ?? null,
    price: o.price,
    paid: o.paid,
  }));

  return (
    <LocationDetailView
      location={{
        id: location.id,
        name: location.name,
        street: location.street,
        zip: location.zip,
        city: location.city,
        distanceKm: location.distanceKm,
        customerTravelCost: prices?.customerPrice ?? null,
        driverCompensation: prices?.driverCompensation ?? null,
        notes: location.notes,
        usageCount: location.usageCount,
      }}
      orders={serializedOrders}
    />
  );
}
