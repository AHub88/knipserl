import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { forwardToAdmin } from "@/lib/track-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/track/pageview/close
// Wird per sendBeacon vom Tracker beim pagehide aufgerufen, weil Beacon
// keine PATCH-Requests unterstützt. Wir nehmen das POST entgegen und
// forwarden als PATCH an den Admin-Ingest.

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: true });
  }
  if (typeof body.id !== "string" || body.id.length < 8) {
    return NextResponse.json({ ok: true });
  }
  const h = await headers();
  const hostHeader = h.get("host");
  const payload: Record<string, unknown> = { id: body.id };
  if (typeof body.durationMs === "number") payload.durationMs = Math.round(body.durationMs);
  if (typeof body.scrollPct === "number") payload.scrollPct = Math.round(body.scrollPct);
  const result = await forwardToAdmin(hostHeader, "ingest/pageview", payload, "PATCH");
  return NextResponse.json({ ok: result.status >= 200 && result.status < 300 });
}
