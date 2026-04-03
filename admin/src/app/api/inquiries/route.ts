import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const createInquirySchema = z.object({
  customerName: z.string().min(1, "Name ist erforderlich"),
  customerEmail: z.string().email("Ungültige E-Mail").or(z.literal("")).default(""),
  customerPhone: z.string().optional(),
  customerType: z.enum(["PRIVATE", "BUSINESS"]).default("PRIVATE"),
  eventDate: z.string().transform((s) => new Date(s)),
  eventType: z.string().min(1, "Eventart ist erforderlich"),
  locationName: z.string().default(""),
  locationAddress: z.string().default(""),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  distanceKm: z.number().nullable().optional(),
  extras: z.array(z.string()).default([]),
  comments: z.string().optional(),
});

// POST /api/inquiries - External endpoint for website form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createInquirySchema.parse(body);

    // Find or create customer
    const emailLower = data.customerEmail?.toLowerCase().trim() || null;
    let customerId: string | null = null;

    if (emailLower) {
      const existing = await prisma.customer.findFirst({
        where: { email: { equals: emailLower, mode: "insensitive" } },
      });
      if (existing) {
        customerId = existing.id;
      }
    }

    if (!customerId) {
      const newCustomer = await prisma.customer.create({
        data: {
          name: data.customerName,
          email: emailLower,
          phone: data.customerPhone || null,
          customerType: data.customerType,
        },
      });
      customerId = newCustomer.id;
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        ...data,
        customerId,
        eventDate: data.eventDate,
      },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msg = error.issues.map((i) => i.message).join(", ");
      return NextResponse.json(
        { error: msg, details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// GET /api/inquiries - Internal endpoint (authenticated)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });

  return NextResponse.json(inquiries);
}
