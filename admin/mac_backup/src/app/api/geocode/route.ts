import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { geocodeAutocomplete } from "@/lib/geocoding";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const results = await geocodeAutocomplete(query);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Geocoding fehlgeschlagen" }, { status: 500 });
  }
}
