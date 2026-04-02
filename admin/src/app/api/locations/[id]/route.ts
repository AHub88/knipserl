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

  const data: Record<string, unknown> = {};
  if (body.notes !== undefined) data.notes = body.notes || null;
  if (body.name !== undefined) data.name = body.name;
  if (body.street !== undefined) data.street = body.street || null;
  if (body.zip !== undefined) data.zip = body.zip || null;
  if (body.city !== undefined) data.city = body.city || null;
  if (body.distanceKm !== undefined) data.distanceKm = body.distanceKm != null ? Number(body.distanceKm) : null;

  const location = await prisma.location.update({
    where: { id },
    data,
  });

  return NextResponse.json(location);
}
