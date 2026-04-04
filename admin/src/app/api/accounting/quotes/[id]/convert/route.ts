import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getNextInvoiceNumber } from "@/lib/numbering";

// POST /api/accounting/quotes/:id/convert - Convert quote to invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { selectedItems, dueDate, deliveryDate, notes } = body;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { company: { select: { id: true, name: true } } },
  });

  if (!quote) {
    return NextResponse.json({ error: "Angebot nicht gefunden" }, { status: 404 });
  }

  // Filter items: include all non-optional + selected optional items
  const allItems = quote.items as Array<{
    title: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
    optional?: boolean;
  }>;

  const invoiceItems = allItems.filter((item) => {
    if (!item.optional) return true; // Always include non-optional
    return selectedItems?.includes(item.title); // Include selected optional items
  });

  // Remove the optional flag for invoice items
  const cleanItems = invoiceItems.map(({ optional: _, ...rest }) => rest);
  const totalAmount = cleanItems.reduce((sum, item) => sum + item.total, 0);

  const invoiceNumber = await getNextInvoiceNumber(quote.companyId);

  const invoice = await prisma.invoice.create({
    data: {
      orderId: quote.orderId,
      companyId: quote.companyId,
      customerId: quote.customerId,
      quoteId: quote.id,
      invoiceNumber,
      recipientName: quote.recipientName,
      recipientAddress: quote.recipientAddress,
      recipientEmail: quote.recipientEmail,
      items: cleanItems,
      totalAmount,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : quote.deliveryDate,
      notes: notes ?? quote.notes,
    },
  });

  // Update quote status to ACCEPTED
  await prisma.quote.update({
    where: { id },
    data: { status: "ACCEPTED" },
  });

  return NextResponse.json(invoice, { status: 201 });
}
