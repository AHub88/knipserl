import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const body = await request.json();

  const {
    customerName,
    customerEmail,
    customerPhone,
    eventType,
    eventDate,
    locationName,
    locationAddress,
    distanceKm,
    companyId,
    driverId,
    secondDriverId,
    paymentMethod,
    price,
    boxPrice,
    travelCost,
    extrasCost,
    setupCost,
    materialCost,
    discount,
    discountType,
    extras,
    notes,
    internalNotes,
    confirmed,
    designReady,
    planned,
    paid,
  } = body;

  if (!customerName || !eventDate || !eventType || !companyId) {
    return NextResponse.json(
      { error: "Name, Datum, Eventart und Firma sind erforderlich" },
      { status: 400 }
    );
  }

  // Determine customer type from company
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return NextResponse.json({ error: "Firma nicht gefunden" }, { status: 400 });
  }
  const customerType = company.name.includes("GbR") ? "BUSINESS" : "PRIVATE";

  // Create inquiry + order in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const inquiry = await tx.inquiry.create({
      data: {
        customerName: customerName || "Unbekannt",
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || null,
        customerType,
        eventDate: new Date(eventDate),
        eventType,
        locationName: locationName || "",
        locationAddress: locationAddress || "",
        distanceKm: distanceKm != null ? Number(distanceKm) : null,
        extras: extras || [],
        comments: notes || null,
        status: "ACCEPTED",
      },
    });

    const order = await tx.order.create({
      data: {
        inquiryId: inquiry.id,
        companyId,
        driverId: driverId || null,
        secondDriverId: secondDriverId || null,
        paymentMethod: paymentMethod || "CASH",
        price: Number(price) || 0,
        boxPrice: boxPrice != null ? Number(boxPrice) : null,
        travelCost: travelCost != null ? Number(travelCost) : null,
        extrasCost: extrasCost != null ? Number(extrasCost) : null,
        setupCost: setupCost != null ? Number(setupCost) : null,
        materialCost: materialCost != null ? Number(materialCost) : null,
        discount: discount != null ? Number(discount) : null,
        discountType: discountType || "AMOUNT",
        extras: extras || [],
        notes: notes || null,
        internalNotes: internalNotes || null,
        eventDate: new Date(eventDate),
        eventType,
        locationName: locationName || "",
        locationAddress: locationAddress || "",
        customerName: customerName || "Unbekannt",
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || null,
        confirmed: confirmed ?? false,
        designReady: designReady ?? false,
        planned: planned ?? false,
        paid: paid ?? false,
      },
    });

    return order;
  });

  return NextResponse.json(result, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const isAccountingAdmin = session.user.role === "ADMIN_ACCOUNTING";

  const orders = await prisma.order.findMany({
    where: isAccountingAdmin ? { paymentMethod: "INVOICE" } : {},
    orderBy: { eventDate: "desc" },
    include: {
      driver: true,
      company: true,
    },
  });

  return NextResponse.json(orders);
}
