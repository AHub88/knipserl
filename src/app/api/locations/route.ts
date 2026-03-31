import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const locations = await prisma.location.findMany({
    orderBy: { usageCount: "desc" },
  });

  return NextResponse.json(locations);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const body = await request.json();
  const { name, street, zip, city, distanceKm } = body;

  if (!name) {
    return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 });
  }

  const location = await prisma.location.create({
    data: {
      name,
      street: street || null,
      zip: zip || null,
      city: city || "",
      distanceKm: distanceKm != null ? Number(distanceKm) : null,
    },
  });

  return NextResponse.json(location, { status: 201 });
}
