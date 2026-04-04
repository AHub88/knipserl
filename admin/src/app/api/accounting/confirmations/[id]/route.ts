import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;
  const confirmation = await prisma.orderConfirmation.findUnique({
    where: { id },
    include: {
      order: { select: { id: true, orderNumber: true } },
      company: { select: { id: true, name: true } },
    },
  });

  if (!confirmation) {
    return NextResponse.json({ error: "Auftragsbestätigung nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json(confirmation);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const confirmation = await prisma.orderConfirmation.update({
    where: { id },
    data: {
      ...(body.sentAt !== undefined && { sentAt: body.sentAt ? new Date(body.sentAt) : new Date() }),
    },
  });

  return NextResponse.json(confirmation);
}
