import { NextRequest, NextResponse } from "next/server";
import { checkTrackSecret, getOrCreateDailySalt, todayUTC } from "@/lib/analytics";

// GET /api/track/salt
// Liefert das täglich rotierte Salt für IP+UA-Hashing an die Webseite-Proxy.
// Wird vom Webseite-Server ~60s gecached, damit nicht pro Pageview ein
// Roundtrip nötig ist.

export async function GET(request: NextRequest) {
  if (!checkTrackSecret(request.headers.get("x-track-secret"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const date = todayUTC();
  const salt = await getOrCreateDailySalt(date);
  return NextResponse.json({ date, salt }, {
    headers: { "Cache-Control": "no-store" },
  });
}
