import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

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

  const invoice = await prisma.incomingInvoice.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.status === "PAID" && { paidAt: new Date() }),
      ...(body.vendor && { vendor: body.vendor }),
      ...(body.amount !== undefined && { amount: body.amount }),
      ...(body.category && { category: body.category }),
    },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.incomingInvoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
