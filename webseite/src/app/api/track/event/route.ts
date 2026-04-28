import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAdminBaseUrl } from "@/lib/admin-url";
import {
  forwardToAdmin,
  getClientIp,
  getDailySalt,
  visitorHash,
  sessionHash,
  currentHalfHourBucket,
  isBot,
} from "@/lib/track-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/track/event
// Wird bei Custom-Events (Form-Submits, Funnel-Steps) aufgerufen.

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const type = typeof body.type === "string" ? body.type.slice(0, 64) : null;
  if (!type) return NextResponse.json({ error: "missing_type" }, { status: 400 });

  const h = await headers();
  const hostHeader = h.get("host");
  const ua = h.get("user-agent") ?? "";
  // Bots werden gar nicht erst erfasst (auch nicht als isBot=true) — Events sind
  // so selten dass Bot-Spam das Funnel verzerren würde.
  if (isBot(ua)) return NextResponse.json({ ok: true, skipped: "bot" });

  const adminBase = getAdminBaseUrl(hostHeader);
  if (!adminBase) return NextResponse.json({ ok: true, skipped: "no_admin_base" });
  const salt = await getDailySalt(adminBase);
  if (!salt) return NextResponse.json({ ok: true, skipped: "no_salt" });

  const ip = await getClientIp();
  const visitorId = visitorHash(salt, ip, ua);
  const sessionId = sessionHash(salt, ip, ua, currentHalfHourBucket());

  const meta = body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)
    ? (body.meta as Record<string, unknown>)
    : null;

  const payload = {
    visitorId,
    sessionId,
    type,
    domain: typeof body.domain === "string" ? body.domain.slice(0, 200) : (hostHeader ?? null),
    path: typeof body.path === "string" ? body.path.slice(0, 1000) : null,
    meta,
  };

  const result = await forwardToAdmin(hostHeader, "ingest/event", payload, "POST");
  return NextResponse.json({ ok: result.status >= 200 && result.status < 300 });
}
