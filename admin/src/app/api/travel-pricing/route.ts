import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const tiers = await prisma.travelPricingTier.findMany({
    orderBy: { distanceKm: "asc" },
  });

  return NextResponse.json(tiers);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const body = await request.json();
  const tiers: { distanceKm: number; driverCompensation: number; customerPrice: number }[] = body;

  if (!Array.isArray(tiers) || tiers.length === 0) {
    return NextResponse.json({ error: "Mindestens eine Stufe erforderlich" }, { status: 400 });
  }

  // Replace all tiers in a transaction
  await prisma.$transaction([
    prisma.travelPricingTier.deleteMany(),
    prisma.travelPricingTier.createMany({
      data: tiers.map((t) => ({
        distanceKm: Math.round(t.distanceKm),
        driverCompensation: t.driverCompensation,
        customerPrice: t.customerPrice,
      })),
    }),
  ]);

  const result = await prisma.travelPricingTier.findMany({
    orderBy: { distanceKm: "asc" },
  });

  return NextResponse.json(result);
}
