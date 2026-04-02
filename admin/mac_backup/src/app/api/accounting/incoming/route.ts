import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const createIncomingSchema = z.object({
  companyId: z.string(),
  vendor: z.string().min(1),
  invoiceNumber: z.string().optional(),
  amount: z.number().min(0),
  dueDate: z
    .string()
    .optional()
    .transform((s) => (s ? new Date(s) : undefined)),
  category: z.string().optional(),
  pdfUrl: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const invoices = await prisma.incomingInvoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { name: true } } },
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
    const data = createIncomingSchema.parse(body);

    const invoice = await prisma.incomingInvoice.create({
      data: {
        companyId: data.companyId,
        vendor: data.vendor,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        dueDate: data.dueDate,
        category: data.category,
        pdfUrl: data.pdfUrl,
      },
      include: { company: { select: { name: true } } },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating incoming invoice:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
