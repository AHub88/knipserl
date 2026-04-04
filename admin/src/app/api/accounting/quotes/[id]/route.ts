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
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      order: { select: { id: true, orderNumber: true } },
      company: { select: { id: true, name: true } },
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "Angebot nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json(quote);
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

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.status === "SENT" && { sentAt: new Date() }),
    },
  });

  return NextResponse.json(quote);
}
