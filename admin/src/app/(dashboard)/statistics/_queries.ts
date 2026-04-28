import { prisma } from "@/lib/db";

// ── Typen ──────────────────────────────────────────────────────────────────

export type AnalyticsRange = 7 | 30 | 90;

export type AnalyticsBundle = {
  range: AnalyticsRange;
  domain: string | null;
  domains: string[];

  // Pageviews-Tab
  totalToday: number;
  total7d: number;
  total30d: number;
  uniqueVisitors30d: number;
  avgDurationMs: number; // 0..n
  avgScrollPct: number;  // 0..100
  bounceRatePct: number; // 0..100
  botCount30d: number;
  pageviewsByDay: { day: string; count: number }[];
  topDomains: { domain: string; count: number }[];
  topPages: { domain: string; path: string; avgDurationMs: number; avgScrollPct: number | null; count: number }[];
  topReferrers: { referrer: string; count: number }[];

  // Besucher-Tab
  byDevice: { name: string; count: number }[];
  byBrowser: { name: string; count: number }[];
  byOs: { name: string; count: number }[];
  byLanguage: { code: string; count: number }[];
  byResolution: { width: number; height: number; count: number }[];
  utmSources: { source: string; visitors: number; pageviews: number }[];
  utmCampaigns: { campaign: string; source: string; medium: string; visitors: number; pageviews: number }[];

  // Events-Tab
  eventsToday: number;
  eventsRange: number;
  registrationsRange: number; // anfrage_submitted
  contactsRange: number;      // kontakt_submitted
  eventsByDay: { day: string; count: number }[];
  eventsByType: { type: string; count: number }[];
  recentEvents: { id: string; createdAt: Date; type: string; path: string | null; domain: string | null; meta: unknown }[];

  // Funnel-Tab
  funnelAnfrage: { opened: number; started: number; submitted: number };
  funnelKontakt: { opened: number; started: number; submitted: number };
};

// ── Hilfsfunktionen ────────────────────────────────────────────────────────

function rangeStart(range: AnalyticsRange): Date {
  const d = new Date();
  d.setDate(d.getDate() - range);
  return d;
}

function startOfTodayUTC(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function pvFilter(domain: string | null, since: Date) {
  return {
    isBot: false,
    createdAt: { gte: since },
    ...(domain ? { domain } : {}),
  };
}

// ── Hauptfunktion ──────────────────────────────────────────────────────────

export async function loadAnalytics(params: {
  range: AnalyticsRange;
  domain: string | null;
}): Promise<AnalyticsBundle> {
  const { range, domain } = params;
  const since = rangeStart(range);
  const since7 = rangeStart(7);
  const since30 = rangeStart(30);
  const todayStart = startOfTodayUTC();

  // Domain-Liste (für Filter-Pillen) — alle jemals gesehenen Domains
  const allDomainsRows = await prisma.analyticsPageview.groupBy({
    by: ["domain"],
    _count: { _all: true },
    where: { isBot: false },
    orderBy: { _count: { domain: "desc" } },
  });
  const domains = allDomainsRows.map((r) => r.domain).filter(Boolean);

  const [
    totalToday,
    total7d,
    total30d,
    uniqueVisitors30dRows,
    avgAggToday30,
    botCount30d,
    pvByDayRows,
    topDomainsRows,
    topPagesRaw,
    topReferrersRaw,
    byDeviceRows,
    byBrowserRows,
    byOsRows,
    byLanguageRows,
    byResolutionRaw,
    utmSourcesRaw,
    utmCampaignsRaw,
    eventsToday,
    eventsRange,
    registrationsRange,
    contactsRange,
    eventsByDayRaw,
    eventsByTypeRows,
    recentEventsRows,
    funnelOpenedAnfrageRaw,
    funnelStartedAnfrageRaw,
    funnelSubmittedAnfrageRaw,
    funnelOpenedKontaktRaw,
    funnelStartedKontaktRaw,
    funnelSubmittedKontaktRaw,
    bounceRaw,
  ] = await Promise.all([
    prisma.analyticsPageview.count({ where: pvFilter(domain, todayStart) }),
    prisma.analyticsPageview.count({ where: pvFilter(domain, since7) }),
    prisma.analyticsPageview.count({ where: pvFilter(domain, since30) }),
    prisma.$queryRawUnsafe<{ visitors: bigint }[]>(
      `SELECT COUNT(DISTINCT "visitorId")::bigint AS visitors
       FROM "analytics_pageviews"
       WHERE "isBot" = false AND "createdAt" >= $1::timestamptz
       ${domain ? `AND "domain" = $2` : ""}`,
      since30,
      ...(domain ? [domain] : []),
    ),
    prisma.analyticsPageview.aggregate({
      _avg: { durationMs: true, scrollPct: true },
      where: { ...pvFilter(domain, since30), durationMs: { gt: 0 } },
    }),
    prisma.analyticsPageview.count({
      where: { isBot: true, createdAt: { gte: since30 }, ...(domain ? { domain } : {}) },
    }),
    prisma.$queryRawUnsafe<{ day: Date; count: bigint }[]>(
      `SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
       FROM "analytics_pageviews"
       WHERE "isBot" = false AND "createdAt" >= $1::timestamptz
       ${domain ? `AND "domain" = $2` : ""}
       GROUP BY 1 ORDER BY 1 ASC`,
      since,
      ...(domain ? [domain] : []),
    ),
    prisma.analyticsPageview.groupBy({
      by: ["domain"],
      _count: { _all: true },
      where: pvFilter(null, since),
      orderBy: { _count: { domain: "desc" } },
      take: 8,
    }),
    prisma.$queryRawUnsafe<
      { domain: string; path: string; avg_duration: number | null; avg_scroll: number | null; count: bigint }[]
    >(
      `SELECT "domain", "path",
              AVG(NULLIF("durationMs", 0))::float AS avg_duration,
              AVG(NULLIF("scrollPct", 0))::float AS avg_scroll,
              COUNT(*)::bigint AS count
       FROM "analytics_pageviews"
       WHERE "isBot" = false AND "createdAt" >= $1::timestamptz
       ${domain ? `AND "domain" = $2` : ""}
       GROUP BY "domain", "path"
       ORDER BY count DESC
       LIMIT 25`,
      since,
      ...(domain ? [domain] : []),
    ),
    prisma.$queryRawUnsafe<{ referrer: string; count: bigint }[]>(
      `SELECT COALESCE(NULLIF("referrerHost", ''), '(direkt)') AS referrer, COUNT(*)::bigint AS count
       FROM "analytics_pageviews"
       WHERE "isBot" = false AND "createdAt" >= $1::timestamptz
       AND "referrerHost" IS NOT NULL AND "referrerHost" <> ''
       ${domain ? `AND "domain" = $2` : ""}
       AND "referrerHost" NOT LIKE '%knipserl.de'
       GROUP BY 1
       ORDER BY count DESC
       LIMIT 15`,
      since,
      ...(domain ? [domain] : []),
    ),
    prisma.analyticsPageview.groupBy({
      by: ["device"],
      _count: { _all: true },
      where: pvFilter(domain, since),
      orderBy: { _count: { device: "desc" } },
    }),
    prisma.analyticsPageview.groupBy({
      by: ["browser"],
      _count: { _all: true },
      where: pvFilter(domain, since),
      orderBy: { _count: { browser: "desc" } },
      take: 8,
    }),
    prisma.analyticsPageview.groupBy({
      by: ["os"],
      _count: { _all: true },
      where: pvFilter(domain, since),
      orderBy: { _count: { os: "desc" } },
      take: 8,
    }),
    prisma.analyticsPageview.groupBy({
      by: ["language"],
      _count: { _all: true },
      where: pvFilter(domain, since),
      orderBy: { _count: { language: "desc" } },
      take: 8,
    }),
    prisma.$queryRawUnsafe<{ width: number; height: number; count: bigint }[]>(
      `SELECT "screenWidth" AS width, "screenHeight" AS height, COUNT(*)::bigint AS count
       FROM "analytics_pageviews"
       WHERE "isBot" = false AND "createdAt" >= $1::timestamptz
       AND "screenWidth" IS NOT NULL AND "screenHeight" IS NOT NULL
       ${domain ? `AND "domain" = $2` : ""}
       GROUP BY 1, 2
       ORDER BY count DESC
       LIMIT 12`,
      since,
      ...(domain ? [domain] : []),
    ),
    prisma.$queryRawUnsafe<{ source: string; visitors: bigint; pageviews: bigint }[]>(
      `SELECT "utmSource" AS source,
              COUNT(DISTINCT "visitorId")::bigint AS visitors,
              COUNT(*)::bigint AS pageviews
       FROM "analytics_pageviews"
       WHERE "isBot" = false AND "createdAt" >= $1::timestamptz
       AND "utmSource" IS NOT NULL AND "utmSource" <> ''
       ${domain ? `AND "domain" = $2` : ""}
       GROUP BY 1
       ORDER BY pageviews DESC
       LIMIT 15`,
      since,
      ...(domain ? [domain] : []),
    ),
    prisma.$queryRawUnsafe<
      { campaign: string; source: string; medium: string; visitors: bigint; pageviews: bigint }[]
    >(
      `SELECT "utmCampaign" AS campaign,
              COALESCE("utmSource", '') AS source,
              COALESCE("utmMedium", '') AS medium,
              COUNT(DISTINCT "visitorId")::bigint AS visitors,
              COUNT(*)::bigint AS pageviews
       FROM "analytics_pageviews"
       WHERE "isBot" = false AND "createdAt" >= $1::timestamptz
       AND "utmCampaign" IS NOT NULL AND "utmCampaign" <> ''
       ${domain ? `AND "domain" = $2` : ""}
       GROUP BY 1, 2, 3
       ORDER BY pageviews DESC
       LIMIT 15`,
      since,
      ...(domain ? [domain] : []),
    ),
    prisma.analyticsEvent.count({
      where: { createdAt: { gte: todayStart }, ...(domain ? { domain } : {}) },
    }),
    prisma.analyticsEvent.count({
      where: { createdAt: { gte: since }, ...(domain ? { domain } : {}) },
    }),
    prisma.analyticsEvent.count({
      where: { type: "anfrage_submitted", createdAt: { gte: since }, ...(domain ? { domain } : {}) },
    }),
    prisma.analyticsEvent.count({
      where: { type: "kontakt_submitted", createdAt: { gte: since }, ...(domain ? { domain } : {}) },
    }),
    prisma.$queryRawUnsafe<{ day: Date; count: bigint }[]>(
      `SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
       FROM "analytics_events"
       WHERE "createdAt" >= $1::timestamptz
       ${domain ? `AND "domain" = $2` : ""}
       GROUP BY 1 ORDER BY 1 ASC`,
      since,
      ...(domain ? [domain] : []),
    ),
    prisma.analyticsEvent.groupBy({
      by: ["type"],
      _count: { _all: true },
      where: { createdAt: { gte: since }, ...(domain ? { domain } : {}) },
      orderBy: { _count: { type: "desc" } },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since }, ...(domain ? { domain } : {}) },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { id: true, createdAt: true, type: true, path: true, domain: true, meta: true },
    }),
    // Funnel Anfrage: opened = pageviews auf /termin-reservieren (unique session)
    prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(DISTINCT "sessionId")::bigint AS count
       FROM "analytics_pageviews"
       WHERE "isBot" = false AND "createdAt" >= $1::timestamptz
       AND "path" = '/termin-reservieren'
       ${domain ? `AND "domain" = $2` : ""}`,
      since,
      ...(domain ? [domain] : []),
    ),
    prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(DISTINCT "sessionId")::bigint AS count
       FROM "analytics_events"
       WHERE "type" = 'anfrage_started' AND "createdAt" >= $1::timestamptz
       ${domain ? `AND "domain" = $2` : ""}`,
      since,
      ...(domain ? [domain] : []),
    ),
    prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(DISTINCT "sessionId")::bigint AS count
       FROM "analytics_events"
       WHERE "type" = 'anfrage_submitted' AND "createdAt" >= $1::timestamptz
       ${domain ? `AND "domain" = $2` : ""}`,
      since,
      ...(domain ? [domain] : []),
    ),
    // Funnel Kontakt: opened = pageviews auf /kontakt
    prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(DISTINCT "sessionId")::bigint AS count
       FROM "analytics_pageviews"
       WHERE "isBot" = false AND "createdAt" >= $1::timestamptz
       AND "path" = '/kontakt'
       ${domain ? `AND "domain" = $2` : ""}`,
      since,
      ...(domain ? [domain] : []),
    ),
    prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(DISTINCT "sessionId")::bigint AS count
       FROM "analytics_events"
       WHERE "type" = 'kontakt_started' AND "createdAt" >= $1::timestamptz
       ${domain ? `AND "domain" = $2` : ""}`,
      since,
      ...(domain ? [domain] : []),
    ),
    prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(DISTINCT "sessionId")::bigint AS count
       FROM "analytics_events"
       WHERE "type" = 'kontakt_submitted' AND "createdAt" >= $1::timestamptz
       ${domain ? `AND "domain" = $2` : ""}`,
      since,
      ...(domain ? [domain] : []),
    ),
    // Bounce-Rate: Anteil der Sessions mit nur 1 Pageview (30T)
    prisma.$queryRawUnsafe<{ total: bigint; bounced: bigint }[]>(
      `WITH session_counts AS (
         SELECT "sessionId", COUNT(*) AS pv_count
         FROM "analytics_pageviews"
         WHERE "isBot" = false AND "createdAt" >= $1::timestamptz
         ${domain ? `AND "domain" = $2` : ""}
         GROUP BY "sessionId"
       )
       SELECT
         COUNT(*)::bigint AS total,
         COUNT(*) FILTER (WHERE pv_count = 1)::bigint AS bounced
       FROM session_counts`,
      since30,
      ...(domain ? [domain] : []),
    ),
  ]);

  const uniqueVisitors30d = Number(uniqueVisitors30dRows[0]?.visitors ?? 0);
  const avgDurationMs = Math.round(avgAggToday30._avg.durationMs ?? 0);
  const avgScrollPct = Math.round(avgAggToday30._avg.scrollPct ?? 0);
  const bounceTotal = Number(bounceRaw[0]?.total ?? 0);
  const bounceBounced = Number(bounceRaw[0]?.bounced ?? 0);
  const bounceRatePct = bounceTotal > 0 ? Math.round((bounceBounced / bounceTotal) * 1000) / 10 : 0;

  return {
    range,
    domain,
    domains,

    totalToday,
    total7d,
    total30d,
    uniqueVisitors30d,
    avgDurationMs,
    avgScrollPct,
    bounceRatePct,
    botCount30d,

    pageviewsByDay: pvByDayRows.map((r) => ({
      day: new Date(r.day).toISOString().slice(0, 10),
      count: Number(r.count),
    })),
    topDomains: topDomainsRows.map((r) => ({ domain: r.domain ?? "(unbekannt)", count: r._count._all })),
    topPages: topPagesRaw.map((r) => ({
      domain: r.domain,
      path: r.path,
      avgDurationMs: Math.round(r.avg_duration ?? 0),
      avgScrollPct: r.avg_scroll != null ? Math.round(r.avg_scroll) : null,
      count: Number(r.count),
    })),
    topReferrers: topReferrersRaw.map((r) => ({ referrer: r.referrer, count: Number(r.count) })),

    byDevice: byDeviceRows.map((r) => ({ name: r.device ?? "Unbekannt", count: r._count._all })),
    byBrowser: byBrowserRows.map((r) => ({ name: r.browser ?? "Unbekannt", count: r._count._all })),
    byOs: byOsRows.map((r) => ({ name: r.os ?? "Unbekannt", count: r._count._all })),
    byLanguage: byLanguageRows.map((r) => ({ code: r.language ?? "??", count: r._count._all })),
    byResolution: byResolutionRaw.map((r) => ({
      width: Number(r.width),
      height: Number(r.height),
      count: Number(r.count),
    })),
    utmSources: utmSourcesRaw.map((r) => ({
      source: r.source,
      visitors: Number(r.visitors),
      pageviews: Number(r.pageviews),
    })),
    utmCampaigns: utmCampaignsRaw.map((r) => ({
      campaign: r.campaign,
      source: r.source,
      medium: r.medium,
      visitors: Number(r.visitors),
      pageviews: Number(r.pageviews),
    })),

    eventsToday,
    eventsRange,
    registrationsRange,
    contactsRange,
    eventsByDay: eventsByDayRaw.map((r) => ({
      day: new Date(r.day).toISOString().slice(0, 10),
      count: Number(r.count),
    })),
    eventsByType: eventsByTypeRows.map((r) => ({ type: r.type, count: r._count._all })),
    recentEvents: recentEventsRows,

    funnelAnfrage: {
      opened: Number(funnelOpenedAnfrageRaw[0]?.count ?? 0),
      started: Number(funnelStartedAnfrageRaw[0]?.count ?? 0),
      submitted: Number(funnelSubmittedAnfrageRaw[0]?.count ?? 0),
    },
    funnelKontakt: {
      opened: Number(funnelOpenedKontaktRaw[0]?.count ?? 0),
      started: Number(funnelStartedKontaktRaw[0]?.count ?? 0),
      submitted: Number(funnelSubmittedKontaktRaw[0]?.count ?? 0),
    },
  };
}
