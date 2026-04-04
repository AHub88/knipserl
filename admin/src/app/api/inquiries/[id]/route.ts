import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/inquiries/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { order: { include: { driver: true, company: { select: { id: true, name: true } } } } },
  });

  if (!inquiry) {
    return NextResponse.json({ error: "Anfrage nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json(inquiry);
}

// PATCH /api/inquiries/:id - Accept or reject
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, price, paymentMethod, boxPrice, travelCost, extrasCost, extras, discount, discountType } = body;

  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) {
    return NextResponse.json({ error: "Anfrage nicht gefunden" }, { status: 404 });
  }

  if (inquiry.status === "ACCEPTED" || inquiry.status === "REJECTED") {
    return NextResponse.json(
      { error: "Anfrage wurde bereits abgeschlossen" },
      { status: 400 }
    );
  }

  if (action === "accept") {
    // Determine company based on customer type
    const companyType = inquiry.customerType === "BUSINESS" ? "GbR" : "Einzelunternehmen";
    const company = await prisma.company.findFirst({
      where: { name: { contains: companyType === "GbR" ? "GbR" : "Andreas Huber" } },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Keine passende Firma gefunden. Bitte Firmen in den Einstellungen anlegen." },
        { status: 400 }
      );
    }

    // Find or create customer
    let customerId = inquiry.customerId;
    if (!customerId) {
      const emailLower = inquiry.customerEmail?.toLowerCase().trim();
      if (emailLower) {
        const existing = await prisma.customer.findFirst({
          where: { email: { equals: emailLower, mode: "insensitive" } },
        });
        if (existing) customerId = existing.id;
      }
      if (!customerId) {
        const newCustomer = await prisma.customer.create({
          data: {
            name: inquiry.customerName,
            email: inquiry.customerEmail || null,
            phone: inquiry.customerPhone || null,
            customerType: inquiry.customerType,
          },
        });
        customerId = newCustomer.id;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedInquiry = await tx.inquiry.update({
        where: { id },
        data: { status: "ACCEPTED", customerId },
      });

      const order = await tx.order.create({
        data: {
          inquiryId: id,
          customerId,
          companyId: company.id,
          paymentMethod: paymentMethod ?? "INVOICE",
          price: price ?? 0,
          boxPrice: boxPrice ?? null,
          travelCost: travelCost ?? null,
          extrasCost: extrasCost ?? null,
          discount: discount ?? null,
          discountType: discountType ?? null,
          eventDate: inquiry.eventDate,
          eventType: inquiry.eventType,
          locationName: inquiry.locationName,
          locationAddress: inquiry.locationAddress,
          customerName: inquiry.customerName,
          customerEmail: inquiry.customerEmail,
          customerPhone: inquiry.customerPhone,
          extras: extras ?? inquiry.extras,
        },
      });

      return { inquiry: updatedInquiry, order };
    });

    // TODO: Send confirmation email to customer

    return NextResponse.json(result);
  }

  if (action === "reject") {
    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    // TODO: Send rejection email to customer

    return NextResponse.json(updatedInquiry);
  }

  if (action === "updateStatus") {
    const { status: newStatus } = body;
    const validStatuses = ["NEW", "CONTACTED", "WAITING", "ACCEPTED", "REJECTED"];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
    }
    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status: newStatus },
    });
    return NextResponse.json(updatedInquiry);
  }

  return NextResponse.json({ error: "Ungültige Aktion" }, { status: 400 });
}
