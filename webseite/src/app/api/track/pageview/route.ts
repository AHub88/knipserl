import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAdminBaseUrl } from "@/lib/admin-url";
import {
  forwardToAdmin,
  getClientIp,
  getDailySalt,
  parseUA,
  isBot,
  visitorHash,
  sessionHash,
  currentHalfHourBucket,
} from "@/lib/track-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/track/pageview
// Wird vom Browser-Tracker beim Pageview aufgerufen. Hasht IP+UA mit täglichem
// Salt zu visitor-/sessionId und proxiet an admin. Liefert die pageview-id zurück.
// Der Close-Beacon (POST /api/track/pageview/close) reicht später durationMs +
// scrollPct nach.

const FIELD_LIMITS = {
  domain: 200,
  path: 1000,
  referrer: 500,
  userAgent: 500,
  language: 16,
  utm: 200,
} as const;

function clip(s: string | null | undefined, max: number): string | null {
  if (s == null) return null;
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const h = await headers();
  const hostHeader = h.get("host");
  const ua = h.get("user-agent") ?? "";
  const ip = await getClientIp();
  const adminBase = getAdminBaseUrl(hostHeader);
  if (!adminBase) {
    // Kein konfigurierter Admin → silent OK, Tracking ist nice-to-have
    return NextResponse.json({ ok: true, skipped: "no_admin_base" });
  }

  const salt = await getDailySalt(adminBase);
  if (!salt) {
    return NextResponse.json({ ok: true, skipped: "no_salt" });
  }

  const visitorId = visitorHash(salt, ip, ua);
  const sessionId = sessionHash(salt, ip, ua, currentHalfHourBucket());
  const parsed = parseUA(ua);
  const bot = isBot(ua);

  const payload = {
    visitorId,
    sessionId,
    domain: clip(typeof body.domain === "string" ? body.domain : hostHeader ?? "", FIELD_LIMITS.domain),
    path: clip(typeof body.path === "string" ? body.path : "/", FIELD_LIMITS.path),
    referrer: clip(typeof body.referrer === "string" ? body.referrer : null, FIELD_LIMITS.referrer),
    userAgent: clip(ua, FIELD_LIMITS.userAgent),
    device: parsed.device,
    browser: parsed.browser,
    os: parsed.os,
    language: clip(typeof body.language === "string" ? body.language : null, FIELD_LIMITS.language),
    screenWidth: typeof body.screenWidth === "number" ? Math.round(body.screenWidth) : null,
    screenHeight: typeof body.screenHeight === "number" ? Math.round(body.screenHeight) : null,
    utmSource: clip(typeof body.utmSource === "string" ? body.utmSource : null, FIELD_LIMITS.utm),
    utmMedium: clip(typeof body.utmMedium === "string" ? body.utmMedium : null, FIELD_LIMITS.utm),
    utmCampaign: clip(typeof body.utmCampaign === "string" ? body.utmCampaign : null, FIELD_LIMITS.utm),
    utmTerm: clip(typeof body.utmTerm === "string" ? body.utmTerm : null, FIELD_LIMITS.utm),
    utmContent: clip(typeof body.utmContent === "string" ? body.utmContent : null, FIELD_LIMITS.utm),
    isBot: bot,
  };

  const result = await forwardToAdmin(hostHeader, "ingest/pageview", payload, "POST");
  if (result.status >= 200 && result.status < 300) {
    const data = result.data as { id?: string };
    return NextResponse.json({ ok: true, id: data.id ?? null });
  }
  return NextResponse.json({ ok: false }, { status: 200 });
}
