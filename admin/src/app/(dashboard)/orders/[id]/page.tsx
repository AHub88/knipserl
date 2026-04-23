import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { OrderDetail } from "./order-detail";
import { shouldHideCashOrders } from "@/lib/view-mode";

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
      driver: { select: { id: true, name: true, initials: true } },
      secondDriver: { select: { id: true, name: true, initials: true } },
      company: { select: { id: true, name: true } },
      inquiry: { select: { distanceKm: true } },
    },
  });

  if (!order) notFound();

  // Design-Token separat laden (Tabelle existiert evtl. noch nicht)
  let designToken: string | null = null;
  try {
    const ld = await prisma.layoutDesign.findUnique({
      where: { orderId: id },
      select: { token: true },
    });
    designToken = ld?.token ?? null;
  } catch {
    // layout_designs table may not exist yet
  }

  const hideCash = await shouldHideCashOrders(session?.user?.role ?? "");
  if (hideCash && order.paymentMethod === "CASH") {
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
    distanceKm: (() => {
      const direct = (order as unknown as { distanceKm?: number | null }).distanceKm;
      if (direct != null && direct > 0) return direct;
      const fromInquiry = order.inquiry?.distanceKm;
      if (fromInquiry != null && fromInquiry > 0) return fromInquiry;
      return null;
    })(),
    setupDate: order.setupDate?.toISOString() ?? null,
    setupTime: order.setupTime,
    teardownDate: order.teardownDate?.toISOString() ?? null,
    teardownTime: order.teardownTime,
    images: order.images,
    startscreenImages: (order as { startscreenImages?: string[] }).startscreenImages ?? [],
    onSiteContactName: (order as { onSiteContactName?: string | null }).onSiteContactName ?? null,
    onSiteContactPhone: (order as { onSiteContactPhone?: string | null }).onSiteContactPhone ?? null,
    onSiteContactNotes: (order as { onSiteContactNotes?: string | null }).onSiteContactNotes ?? null,
    extraPaperRolls: (order as { extraPaperRolls?: number }).extraPaperRolls ?? 0,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    graphicUrl: order.graphicUrl,
    confirmationToken: order.confirmationToken,
    confirmedByCustomerAt: order.confirmedByCustomerAt?.toISOString() ?? null,
    designToken,
    locationId: null as string | null,
  };

  // Find matching location for link — and pull distanceKm as fallback if order has none
  const matchingLocation = await prisma.location.findFirst({
    where: { name: order.locationName },
    select: { id: true, distanceKm: true },
  });
  if (matchingLocation) {
    serialized.locationId = matchingLocation.id;
    if (
      serialized.distanceKm == null &&
      matchingLocation.distanceKm != null &&
      matchingLocation.distanceKm > 0
    ) {
      serialized.distanceKm = matchingLocation.distanceKm;
    }
  }

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
