import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateDrivingDistance } from "@/lib/geocoding";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const toLat = Number(request.nextUrl.searchParams.get("toLat"));
  const toLng = Number(request.nextUrl.searchParams.get("toLng"));

  if (isNaN(toLat) || isNaN(toLng)) {
    return NextResponse.json({ error: "toLat und toLng sind erforderlich" }, { status: 400 });
  }

  // Get start address from settings
  const startLatSetting = await prisma.appSetting.findUnique({ where: { key: "startLat" } });
  const startLngSetting = await prisma.appSetting.findUnique({ where: { key: "startLng" } });

  if (!startLatSetting || !startLngSetting) {
    return NextResponse.json(
      { error: "Startadresse nicht konfiguriert. Bitte unter Einstellungen hinterlegen." },
      { status: 400 }
    );
  }

  const fromLat = Number(startLatSetting.value);
  const fromLng = Number(startLngSetting.value);

  try {
    const distanceKm = await calculateDrivingDistance(fromLat, fromLng, toLat, toLng);
    if (distanceKm == null) {
      return NextResponse.json({ error: "Route konnte nicht berechnet werden" }, { status: 500 });
    }
    return NextResponse.json({ distanceKm });
  } catch {
    return NextResponse.json({ error: "Entfernungsberechnung fehlgeschlagen" }, { status: 500 });
  }
}
