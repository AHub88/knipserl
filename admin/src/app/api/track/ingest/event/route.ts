import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { checkTrackSecret, normalizePath } from "@/lib/analytics";

// POST /api/track/ingest/event
// Empfängt vorgehashte Identifier vom Webseite-Proxy.

const eventSchema = z.object({
  visitorId: z.string().min(8),
  sessionId: z.string().min(8),
  type: z.string().min(1).max(64),
  domain: z.string().optional().nullable(),
  path: z.string().optional().nullable(),
  meta: z.record(z.string(), z.unknown()).optional().nullable(),
});

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
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  const d = parsed.data;
  try {
    await prisma.analyticsEvent.create({
      data: {
        visitorId: d.visitorId,
        sessionId: d.sessionId,
        type: d.type,
        domain: d.domain ? d.domain.slice(0, 200) : null,
        path: d.path ? normalizePath(d.path.slice(0, 1000)) : null,
        meta: d.meta ? (d.meta as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[track/event] create failed", e);
    return NextResponse.json({ error: "store_failed" }, { status: 500 });
  }
}
