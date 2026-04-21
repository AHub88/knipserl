import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteProcessed } from "@/lib/impression-images";

export const runtime = "nodejs";

// PATCH — update alt text, sortOrder, active
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const data: { alt?: string; sortOrder?: number; active?: boolean } = {};
  if (typeof body.alt === "string") data.alt = body.alt.trim();
  if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;
  if (typeof body.active === "boolean") data.active = body.active;

  const photo = await prisma.impressionPhoto.update({ where: { id }, data });
  return NextResponse.json({ id: photo.id, alt: photo.alt, sortOrder: photo.sortOrder, active: photo.active });
}

// DELETE — remove photo and all derived files
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;
  const photo = await prisma.impressionPhoto.findUnique({ where: { id } });
  if (!photo) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  await prisma.impressionPhoto.delete({ where: { id } });
  await deleteProcessed(photo.originalFilename);

  return NextResponse.json({ ok: true });
}
