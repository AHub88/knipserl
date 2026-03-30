import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      driver: true,
      company: true,
      inquiry: true,
      quotes: true,
      invoices: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Auftrag nicht gefunden" }, { status: 404 });
  }

  // Hide cash orders from accounting admin
  if (session.user.role === "ADMIN_ACCOUNTING" && order.paymentMethod === "CASH") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Drivers can only assign themselves
  if (session.user.role === "DRIVER") {
    if (body.driverId && body.driverId !== session.user.id) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
    }
    const order = await prisma.order.update({
      where: { id },
      data: {
        driverId: session.user.id,
        status: "ASSIGNED",
      },
    });
    return NextResponse.json(order);
  }

  // Admins can update everything
  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(body.driverId !== undefined && { driverId: body.driverId }),
      ...(body.status && { status: body.status }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
      ...(body.status === "COMPLETED" && { completedAt: new Date() }),
    },
  });

  return NextResponse.json(order);
}
