import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkTrackSecret, normalizePath, referrerHost } from "@/lib/analytics";

// POST  → neue Pageview anlegen, gibt id zurück
// PATCH → durationMs/scrollPct nachreichen (per sendBeacon vom Client)
// Beide Endpunkte sind nur über das Webseite-Proxy erreichbar (Shared-Secret).

const createSchema = z.object({
  visitorId: z.string().min(8),
  sessionId: z.string().min(8),
  domain: z.string().min(1),
  path: z.string().min(1),
  referrer: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  device: z.string().optional().nullable(),
  browser: z.string().optional().nullable(),
  os: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  screenWidth: z.number().int().optional().nullable(),
  screenHeight: z.number().int().optional().nullable(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmTerm: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
  isBot: z.boolean().optional(),
});

const patchSchema = z.object({
  id: z.string().min(8),
  durationMs: z.number().int().min(0).max(60 * 60 * 1000).optional(),
  scrollPct: z.number().int().min(0).max(100).optional(),
});

function clip(v: string | null | undefined, max: number): string | null {
  if (!v) return null;
  return v.length > max ? v.slice(0, max) : v;
}

export async function POST(request: NextRequest) {
  if (!checkTrackSecret(request.headers.get("x-track-secret"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  const d = parsed.data;
  try {
    const created = await prisma.analyticsPageview.create({
      data: {
        visitorId: d.visitorId,
        sessionId: d.sessionId,
        domain: clip(d.domain, 200) ?? "",
        path: normalizePath(clip(d.path, 1000) ?? "/"),
        referrer: clip(d.referrer, 500),
        referrerHost: referrerHost(d.referrer),
        userAgent: clip(d.userAgent, 500),
        device: clip(d.device, 32),
        browser: clip(d.browser, 64),
        os: clip(d.os, 64),
        language: clip(d.language, 16),
        screenWidth: d.screenWidth ?? null,
        screenHeight: d.screenHeight ?? null,
        utmSource: clip(d.utmSource, 200),
        utmMedium: clip(d.utmMedium, 200),
        utmCampaign: clip(d.utmCampaign, 200),
        utmTerm: clip(d.utmTerm, 200),
        utmContent: clip(d.utmContent, 200),
        isBot: d.isBot ?? false,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: created.id });
  } catch (e) {
    console.error("[track/pageview] create failed", e);
    return NextResponse.json({ error: "store_failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!checkTrackSecret(request.headers.get("x-track-secret"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  const d = parsed.data;
  try {
    await prisma.analyticsPageview.update({
      where: { id: d.id },
      data: {
        ...(d.durationMs != null ? { durationMs: d.durationMs } : {}),
        ...(d.scrollPct != null ? { scrollPct: d.scrollPct } : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Row gone (gelöscht/abgelaufen) → silently OK, Beacon ist Best-Effort.
    return NextResponse.json({ ok: true });
  }
}
