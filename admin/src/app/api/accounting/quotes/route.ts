import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getNextQuoteNumber } from "@/lib/numbering";

const createQuoteSchema = z.object({
  orderId: z.string(),
  companyId: z.string(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
    })
  ),
  validUntil: z.string().transform((s) => new Date(s)),
});

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
    const data = createQuoteSchema.parse(body);

    const items = data.items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    const quoteNumber = await getNextQuoteNumber(data.companyId);

    const quote = await prisma.quote.create({
      data: {
        orderId: data.orderId,
        companyId: data.companyId,
        quoteNumber,
        items: JSON.parse(JSON.stringify(items)),
        totalAmount,
        validUntil: data.validUntil,
      },
      include: {
        order: { select: { customerName: true } },
        company: { select: { name: true } },
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating quote:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
