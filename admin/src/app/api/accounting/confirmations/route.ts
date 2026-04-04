import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getNextConfirmationNumber } from "@/lib/numbering";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const confirmations = await prisma.orderConfirmation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { customerName: true, orderNumber: true } },
      company: { select: { name: true } },
    },
  });

  return NextResponse.json(confirmations);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { companyId, orderId, recipientName, recipientAddress, recipientEmail, items, deliveryDate, notes } = body;

    if (!companyId || !orderId || !recipientName || !items?.length) {
      return NextResponse.json({ error: "Firma, Auftrag, Empfänger und Positionen sind Pflichtfelder" }, { status: 400 });
    }

    const processedItems = items.map((item: { title: string; description?: string; quantity: number; unitPrice: number; optional?: boolean }) => ({
      title: item.title,
      description: item.description || "",
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0),
      optional: item.optional || false,
    }));

    const totalAmount = processedItems
      .filter((item: { optional: boolean }) => !item.optional)
      .reduce((sum: number, item: { total: number }) => sum + item.total, 0);

    const confirmationNumber = await getNextConfirmationNumber(companyId);

    const confirmation = await prisma.orderConfirmation.create({
      data: {
        companyId,
        orderId,
        confirmationNumber,
        recipientName,
        recipientAddress: recipientAddress || null,
        recipientEmail: recipientEmail || null,
        items: processedItems,
        totalAmount,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes: notes || null,
      },
      include: {
        order: { select: { customerName: true } },
        company: { select: { name: true } },
      },
    });

    return NextResponse.json(confirmation, { status: 201 });
  } catch (error) {
    console.error("Error creating confirmation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
