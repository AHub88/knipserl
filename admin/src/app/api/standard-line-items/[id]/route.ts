import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// PATCH /api/standard-line-items/:id
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

  const item = await prisma.standardLineItem.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.unitPrice !== undefined && { unitPrice: Number(body.unitPrice) }),
      ...(body.category !== undefined && { category: body.category || null }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      ...(body.active !== undefined && { active: body.active }),
    },
  });

  return NextResponse.json(item);
}

// DELETE /api/standard-line-items/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.standardLineItem.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
