import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Auftrag nicht gefunden" }, { status: 404 });
  }

  // Check if design already exists
  const existing = await prisma.layoutDesign.findUnique({
    where: { orderId: id },
    select: { token: true },
  });

  if (existing) {
    return NextResponse.json({ token: existing.token });
  }

  // Create new design
  const design = await prisma.layoutDesign.create({
    data: {
      orderId: id,
      canvasJson: {},
    },
    select: { token: true },
  });

  return NextResponse.json({ token: design.token });
}
