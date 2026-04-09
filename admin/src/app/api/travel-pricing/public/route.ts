import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public endpoint — returns pricing tiers for the website configurator
export async function GET() {
  const tiers = await prisma.travelPricingTier.findMany({
    orderBy: { distanceKm: "asc" },
    select: { distanceKm: true, customerPrice: true },
  });

  return NextResponse.json(tiers);
}
