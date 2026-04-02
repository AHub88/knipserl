import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getNextInvoiceNumber } from "@/lib/numbering";

const createInvoiceSchema = z.object({
  orderId: z.string(),
  companyId: z.string(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
    })
  ),
  dueDate: z.string().transform((s) => new Date(s)),
});

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
    const data = createInvoiceSchema.parse(body);

    // Check that the order uses INVOICE payment method
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
    });
    if (!order) {
      return NextResponse.json({ error: "Auftrag nicht gefunden" }, { status: 404 });
    }
    if (order.paymentMethod === "CASH") {
      return NextResponse.json(
        { error: "Für BAR-Aufträge werden keine Rechnungen erstellt" },
        { status: 400 }
      );
    }

    const items = data.items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    const invoiceNumber = await getNextInvoiceNumber(data.companyId);

    const invoice = await prisma.invoice.create({
      data: {
        orderId: data.orderId,
        companyId: data.companyId,
        invoiceNumber,
        items: JSON.parse(JSON.stringify(items)),
        totalAmount,
        dueDate: data.dueDate,
      },
      include: {
        order: { select: { customerName: true } },
        company: { select: { name: true } },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
