import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isPasswordStrongEnough } from "@/lib/passwords";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, phone, initials, vehiclePlate, role, password } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name und E-Mail sind erforderlich" },
      { status: 400 }
    );
  }

  if (!isPasswordStrongEnough(password)) {
    return NextResponse.json(
      { error: "Passwort ist erforderlich (mindestens 8 Zeichen)" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "E-Mail-Adresse bereits vergeben" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role || "DRIVER",
      phone: phone || null,
      initials: initials || null,
      vehiclePlate: vehiclePlate || null,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
