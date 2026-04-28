import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isPasswordStrongEnough } from "@/lib/passwords";
import bcrypt from "bcryptjs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }
  // passwordHash darf nie an den Client geliefert werden
  const { passwordHash: _ignored, ...safe } = user;
  void _ignored;
  return NextResponse.json(safe);
}

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

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) data.email = body.email;
  if (body.phone !== undefined) data.phone = body.phone || null;
  if (body.initials !== undefined) data.initials = body.initials || null;
  if (body.role !== undefined) data.role = body.role;
  if (body.active !== undefined) data.active = body.active;

  // Passwort-Reset: optional, nur wenn übergeben + Mindestlänge
  if (body.password !== undefined) {
    if (!isPasswordStrongEnough(body.password)) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 8 Zeichen haben" },
        { status: 400 }
      );
    }
    data.passwordHash = await bcrypt.hash(body.password, 12);
  }

  const user = await prisma.user.update({ where: { id }, data });
  const { passwordHash: _ignored, ...safe } = user;
  void _ignored;
  return NextResponse.json(safe);
}
