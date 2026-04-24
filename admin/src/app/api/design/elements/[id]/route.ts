import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// DELETE /api/design/elements/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.designElement.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

// PATCH /api/design/elements/[id] — active toggle und/oder name/category bearbeiten
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
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.name === "string" && body.name.trim().length > 0) {
    data.name = body.name.trim();
  }
  if ("category" in body) {
    const cat = typeof body.category === "string" ? body.category.trim() : "";
    data.category = cat.length > 0 ? cat : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Keine gültigen Felder zum Aktualisieren" },
      { status: 400 }
    );
  }

  const element = await prisma.designElement.update({ where: { id }, data });
  return NextResponse.json(element);
}
