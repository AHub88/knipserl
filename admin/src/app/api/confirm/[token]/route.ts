import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const order = await prisma.order.findUnique({
    where: { confirmationToken: token },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      eventDate: true,
      eventType: true,
      locationName: true,
      locationAddress: true,
      extras: true,
      price: true,
      travelCost: true,
      boxPrice: true,
      extrasCost: true,
      setupDate: true,
      setupTime: true,
      teardownDate: true,
      teardownTime: true,
      notes: true,
      confirmed: true,
      confirmedByCustomerAt: true,
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Auftrag nicht gefunden" },
      { status: 404 }
    );
  }

  return NextResponse.json(order);
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const order = await prisma.order.findUnique({
    where: { confirmationToken: token },
    select: { id: true, confirmedByCustomerAt: true },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Auftrag nicht gefunden" },
      { status: 404 }
    );
  }

  if (order.confirmedByCustomerAt) {
    return NextResponse.json({ message: "Bereits bestätigt", alreadyConfirmed: true });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      confirmed: true,
      confirmedByCustomerAt: new Date(),
    },
  });

  return NextResponse.json({ message: "Erfolgreich bestätigt", confirmed: true });
}
