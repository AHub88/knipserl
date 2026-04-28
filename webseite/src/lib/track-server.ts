import crypto from "node:crypto";
import { headers } from "next/headers";
import { getAdminBaseUrl } from "@/lib/admin-url";

// Server-seitige Tracking-Utilities für die Webseite.
// IP wird hier kurz im Speicher gehalten (für Hashing), aber NIE gespeichert
// oder weitergeleitet — admin sieht nur den salzgehashten visitorId/sessionId.

function trackSecret(): string {
  return process.env.TRACK_SHARED_SECRET || "knipserl-dev-track-secret";
}

// ── Salt-Cache ─────────────────────────────────────────────────────────────
// 60s in-process — verhindert pro Pageview einen Roundtrip zum Admin.

let saltCache: { date: string; salt: string; fetchedAt: number } | null = null;
const SALT_CACHE_TTL_MS = 60 * 1000;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getDailySalt(adminBase: string): Promise<string | null> {
  const date = todayUTC();
  const now = Date.now();
  if (
    saltCache &&
    saltCache.date === date &&
    now - saltCache.fetchedAt < SALT_CACHE_TTL_MS
  ) {
    return saltCache.salt;
  }
  try {
    const res = await fetch(`${adminBase}/api/track/salt`, {
      method: "GET",
      headers: { "x-track-secret": trackSecret() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { date: string; salt: string };
    saltCache = { date: data.date, salt: data.salt, fetchedAt: now };
    return data.salt;
  } catch {
    return null;
  }
}

// ── IP aus Request-Header (Hetzner/Reverse-Proxy-Setup) ───────────────────

export async function getClientIp(): Promise<string> {
  const h = await headers();
  // Reihenfolge: cf-connecting-ip > x-real-ip > x-forwarded-for (erstes Element)
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return "0.0.0.0";
}

// ── User-Agent-Parser (Mirror von admin/src/lib/analytics.ts) ──────────────

export type ParsedUA = { browser: string; os: string; device: "desktop" | "mobile" | "tablet" };

export function parseUA(ua: string | null | undefined): ParsedUA {
  const u = (ua ?? "").toLowerCase();
  if (!u) return { browser: "Unbekannt", os: "Unbekannt", device: "desktop" };

  let os = "Unbekannt";
  if (u.includes("windows")) os = "Windows";
  else if (u.includes("mac os x") || u.includes("macintosh")) os = "macOS";
  else if (u.includes("android")) os = "Android";
  else if (u.includes("iphone") || u.includes("ipad") || u.includes("ios")) os = "iOS";
  else if (u.includes("linux")) os = "Linux";

  let browser = "Unbekannt";
  if (u.includes("edg/")) browser = "Edge";
  else if (u.includes("opr/") || u.includes("opera")) browser = "Opera";
  else if (u.includes("samsungbrowser")) browser = "Samsung Internet";
  else if (u.includes("chrome/") && !u.includes("chromium/")) browser = "Chrome";
  else if (u.includes("firefox/")) browser = "Firefox";
  else if (u.includes("safari/") && !u.includes("chrome/")) browser = "Safari";

  let device: ParsedUA["device"] = "desktop";
  const isTablet = u.includes("ipad") || (u.includes("android") && !u.includes("mobile"));
  const isMobile =
    u.includes("mobile") ||
    u.includes("iphone") ||
    u.includes("android") ||
    u.includes("blackberry") ||
    u.includes("windows phone");
  if (isTablet) device = "tablet";
  else if (isMobile) device = "mobile";

  return { browser, os, device };
}

const BOT_PATTERNS = [
  "bot", "crawler", "spider", "slurp", "facebookexternalhit", "ia_archiver",
  "google-site-verification", "googlebot", "bingbot", "duckduckbot", "yandex",
  "baidu", "headlesschrome", "phantomjs", "puppeteer", "playwright",
  "lighthouse", "pagespeed", "ahrefsbot", "semrushbot", "screaming frog",
  "petalbot", "applebot", "embedly", "wp-rocket", "linkedinbot",
  "twitterbot", "pinterest", "whatsapp", "telegrambot", "discordbot",
  "slackbot", "skype", "msn", "preview", "monitor",
];

export function isBot(ua: string | null | undefined): boolean {
  if (!ua) return true;
  const u = ua.toLowerCase();
  return BOT_PATTERNS.some((p) => u.includes(p));
}

// ── Identifier-Hashing (Plausible-Modell) ─────────────────────────────────

export function visitorHash(salt: string, ip: string, ua: string): string {
  return crypto.createHash("sha256").update(`${salt}|${ip}|${ua}|v`).digest("hex").slice(0, 32);
}

export function sessionHash(salt: string, ip: string, ua: string, halfHourBucket: number): string {
  return crypto.createHash("sha256")
    .update(`${salt}|${ip}|${ua}|s|${halfHourBucket}`)
    .digest("hex")
    .slice(0, 32);
}

export function currentHalfHourBucket(date = new Date()): number {
  return Math.floor(date.getTime() / (1000 * 60 * 30));
}

// ── Forward an Admin ───────────────────────────────────────────────────────

export async function forwardToAdmin(
  hostHeader: string | null,
  pathSuffix: "ingest/pageview" | "ingest/event",
  body: unknown,
  method: "POST" | "PATCH" = "POST",
): Promise<{ status: number; data: unknown }> {
  const base = getAdminBaseUrl(hostHeader);
  if (!base) return { status: 503, data: { error: "no_admin_base" } };
  try {
    const res = await fetch(`${base}/api/track/${pathSuffix}`, {
      method,
      headers: {
        "content-type": "application/json",
        "x-track-secret": trackSecret(),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as unknown;
    return { status: res.status, data };
  } catch (e) {
    console.error("[track/forward] failed", e);
    return { status: 502, data: { error: "forward_failed" } };
  }
}
