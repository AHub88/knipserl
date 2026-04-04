import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getNextInvoiceNumber } from "@/lib/numbering";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { customerName: true, orderNumber: true, paymentMethod: true } },
      company: { select: { name: true } },
      customer: { select: { name: true } },
    },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { companyId, orderId, customerId, quoteId, recipientName, recipientAddress, recipientEmail, items, dueDate, deliveryDate, notes } = body;

    if (!companyId || !recipientName || !items?.length || !dueDate) {
      return NextResponse.json({ error: "Firma, Empfänger, Positionen und Fälligkeitsdatum sind Pflichtfelder" }, { status: 400 });
    }

    // Validate order payment method if linked
    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order?.paymentMethod === "CASH") {
        return NextResponse.json(
          { error: "Für BAR-Aufträge werden keine Rechnungen erstellt" },
          { status: 400 }
        );
      }
    }

    const processedItems = items.map((item: { title: string; description?: string; quantity: number; unitPrice: number }) => ({
      title: item.title,
      description: item.description || "",
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0),
    }));

    const totalAmount = processedItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);

    const invoiceNumber = await getNextInvoiceNumber(companyId);

    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        orderId: orderId || null,
        customerId: customerId || null,
        quoteId: quoteId || null,
        invoiceNumber,
        recipientName,
        recipientAddress: recipientAddress || null,
        recipientEmail: recipientEmail || null,
        items: processedItems,
        totalAmount,
        dueDate: new Date(dueDate),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes: notes || null,
      },
      include: {
        company: { select: { name: true } },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
