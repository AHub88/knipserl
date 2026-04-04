import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getNextQuoteNumber } from "@/lib/numbering";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { customerName: true, orderNumber: true } },
      company: { select: { name: true } },
      customer: { select: { name: true } },
    },
  });

  return NextResponse.json(quotes);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { companyId, orderId, customerId, recipientName, recipientAddress, recipientEmail, items, validUntil, deliveryDate, notes } = body;

    if (!companyId || !recipientName || !items?.length || !validUntil) {
      return NextResponse.json({ error: "Firma, Empfänger, Positionen und Gültig-bis sind Pflichtfelder" }, { status: 400 });
    }

    const processedItems = items.map((item: { title: string; description?: string; quantity: number; unitPrice: number; optional?: boolean }) => ({
      title: item.title,
      description: item.description || "",
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0),
      optional: item.optional || false,
    }));

    // Total only includes non-optional items
    const totalAmount = processedItems
      .filter((item: { optional: boolean }) => !item.optional)
      .reduce((sum: number, item: { total: number }) => sum + item.total, 0);

    const quoteNumber = await getNextQuoteNumber(companyId);

    const quote = await prisma.quote.create({
      data: {
        companyId,
        orderId: orderId || null,
        customerId: customerId || null,
        quoteNumber,
        recipientName,
        recipientAddress: recipientAddress || null,
        recipientEmail: recipientEmail || null,
        items: processedItems,
        totalAmount,
        validUntil: new Date(validUntil),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes: notes || null,
      },
      include: {
        order: { select: { customerName: true } },
        company: { select: { name: true } },
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
