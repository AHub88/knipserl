import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { calculateTravelPrice } from "@/lib/travel-pricing";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const distanceKm = Number(request.nextUrl.searchParams.get("distanceKm"));
  if (isNaN(distanceKm)) {
    return NextResponse.json({ error: "distanceKm ist erforderlich" }, { status: 400 });
  }

  const result = await calculateTravelPrice(distanceKm);
  return NextResponse.json(result);
}
