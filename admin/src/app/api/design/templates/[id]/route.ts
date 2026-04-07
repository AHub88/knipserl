import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// DELETE /api/design/templates/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.layoutTemplate.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

// PATCH /api/design/templates/[id] — toggle active
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

  const template = await prisma.layoutTemplate.update({
    where: { id },
    data: { active: body.active },
  });

  return NextResponse.json(template);
}

// POST /api/design/templates/[id] — duplicate template
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;

  const original = await prisma.layoutTemplate.findUnique({ where: { id } });
  if (!original) {
    return NextResponse.json({ error: "Vorlage nicht gefunden" }, { status: 404 });
  }

  const copy = await prisma.layoutTemplate.create({
    data: {
      name: `${original.name} (Kopie)`,
      format: original.format,
      category: original.category,
      thumbnail: original.thumbnail,
      canvasJson: original.canvasJson ?? { version: "6.6.1", objects: [] },
      active: false,
    },
  });

  return NextResponse.json(copy, { status: 201 });
}

// PUT /api/design/templates/[id] — update template (name, format, category, canvasJson)
export async function PUT(
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
  if (body.name !== undefined) data.name = body.name;
  if (body.format !== undefined) data.format = body.format;
  if (body.category !== undefined) data.category = body.category || null;
  if (body.canvasJson !== undefined) data.canvasJson = body.canvasJson;
  if (body.thumbnail !== undefined) data.thumbnail = body.thumbnail || null;

  const template = await prisma.layoutTemplate.update({
    where: { id },
    data,
  });

  return NextResponse.json(template);
}
