import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/statistics/live
// Liefert aktive Sessions der letzten 5 Minuten. Nur für ADMIN-Rolle.
//
// Polling-Endpunkt: vom /statistics-Tab "Live" alle 10s aufgerufen.
// Cache-Control: no-store damit Browser nichts cached.

const ACTIVE_WINDOW_SEC = 5 * 60;

export const dynamic = "force-dynamic";

type LiveVisitor = {
  sessionShort: string;
  currentDomain: string;
  currentPath: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  language: string | null;
  referrerHost: string | null;
  startedAt: string;        // ISO, ältester pageview der Session
  lastSeenAt: string;       // ISO, jüngster pageview der Session
  pageviewCount: number;
  inSessionSeconds: number; // Differenz lastSeen - started, in Sekunden
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const domainParam = url.searchParams.get("domain");
  const domain = domainParam && domainParam !== "all" ? domainParam : null;

  const sinceCutoff = new Date(Date.now() - ACTIVE_WINDOW_SEC * 1000);

  // Pro aktiver Session den jüngsten Pageview ziehen — das ist die "aktuelle Seite".
  // DISTINCT ON (sessionId) sortiert nach createdAt DESC liefert genau das.
  const rows = await prisma.$queryRawUnsafe<{
    session_id: string;
    domain: string;
    path: string;
    device: string | null;
    browser: string | null;
    os: string | null;
    language: string | null;
    referrer_host: string | null;
    last_seen: Date;
    first_seen: Date;
    pv_count: bigint;
  }[]>(
    `SELECT DISTINCT ON ("sessionId")
       "sessionId" AS session_id,
       "domain", "path", "device", "browser", "os", "language",
       "referrerHost" AS referrer_host,
       "createdAt" AS last_seen,
       (SELECT MIN("createdAt") FROM "analytics_pageviews" inner_pv
          WHERE inner_pv."sessionId" = outer_pv."sessionId"
          AND inner_pv."createdAt" >= $1::timestamptz
          ${domain ? `AND inner_pv."domain" = $2` : ""}) AS first_seen,
       (SELECT COUNT(*) FROM "analytics_pageviews" inner_pv
          WHERE inner_pv."sessionId" = outer_pv."sessionId"
          AND inner_pv."createdAt" >= $1::timestamptz
          ${domain ? `AND inner_pv."domain" = $2` : ""})::bigint AS pv_count
     FROM "analytics_pageviews" outer_pv
     WHERE "isBot" = false
       AND "createdAt" >= $1::timestamptz
       ${domain ? `AND "domain" = $2` : ""}
     ORDER BY "sessionId", "createdAt" DESC
     LIMIT 100`,
    sinceCutoff,
    ...(domain ? [domain] : []),
  );

  const visitors: LiveVisitor[] = rows
    .map((r) => {
      const started = new Date(r.first_seen);
      const last = new Date(r.last_seen);
      return {
        sessionShort: r.session_id.slice(0, 8),
        currentDomain: r.domain ?? "",
        currentPath: r.path ?? "/",
        device: r.device,
        browser: r.browser,
        os: r.os,
        language: r.language,
        referrerHost: r.referrer_host,
        startedAt: started.toISOString(),
        lastSeenAt: last.toISOString(),
        pageviewCount: Number(r.pv_count),
        inSessionSeconds: Math.max(0, Math.round((last.getTime() - started.getTime()) / 1000)),
      };
    })
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));

  // Aggregations für die Live-Übersicht
  const byPath = new Map<string, { count: number; domain: string }>();
  const byDevice = new Map<string, number>();
  const byReferrer = new Map<string, number>();
  for (const v of visitors) {
    const pkey = `${v.currentDomain}|${v.currentPath}`;
    const cur = byPath.get(pkey);
    byPath.set(pkey, { count: (cur?.count ?? 0) + 1, domain: v.currentDomain });
    if (v.device) byDevice.set(v.device, (byDevice.get(v.device) ?? 0) + 1);
    if (v.referrerHost) byReferrer.set(v.referrerHost, (byReferrer.get(v.referrerHost) ?? 0) + 1);
  }

  const byPathRows = Array.from(byPath.entries())
    .map(([k, v]) => {
      const [d, ...pParts] = k.split("|");
      return { domain: d ?? "", path: pParts.join("|") || "/", count: v.count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const byDeviceRows = Array.from(byDevice.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  const byReferrerRows = Array.from(byReferrer.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return NextResponse.json(
    {
      activeCount: visitors.length,
      windowSeconds: ACTIVE_WINDOW_SEC,
      visitors: visitors.slice(0, 25),
      byPath: byPathRows,
      byDevice: byDeviceRows,
      byReferrer: byReferrerRows,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
