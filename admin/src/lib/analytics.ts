import crypto from "node:crypto";
import { prisma } from "@/lib/db";

// ── Shared secret zwischen Webseite-Proxy und Admin-Ingest ─────────────────
// Webseite muss diesen Header schicken: X-Track-Secret
export function getTrackSecret(): string {
  return process.env.TRACK_SHARED_SECRET || "knipserl-dev-track-secret";
}

export function checkTrackSecret(headerValue: string | null): boolean {
  if (!headerValue) return false;
  // Konstantzeit-Vergleich
  const expected = getTrackSecret();
  if (headerValue.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(headerValue), Buffer.from(expected));
}

// ── Daily-Salt Management ──────────────────────────────────────────────────
// Salt rotiert täglich (UTC). Nach Ablauf sind visitorId/sessionId nicht mehr
// re-identifizierbar, da sich der Salt geändert hat.

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getOrCreateDailySalt(date = todayUTC()): Promise<string> {
  const existing = await prisma.analyticsDailySalt.findUnique({ where: { date } });
  if (existing) return existing.salt;
  const salt = crypto.randomBytes(32).toString("hex");
  try {
    const created = await prisma.analyticsDailySalt.create({ data: { date, salt } });
    return created.salt;
  } catch {
    // Race-Condition: zwischen findUnique und create wurde von anderem Prozess angelegt
    const retry = await prisma.analyticsDailySalt.findUnique({ where: { date } });
    return retry?.salt ?? salt;
  }
}

// ── User-Agent-Parser (kein externes Paket — das wäre overkill) ────────────
// Erkennt grobe Klassen für Browser/OS/Device. Für genauere Bots-Liste siehe isBot.

export type ParsedUA = {
  browser: string;
  os: string;
  device: "desktop" | "mobile" | "tablet";
};

export function parseUA(ua: string | null | undefined): ParsedUA {
  const u = (ua ?? "").toLowerCase();
  if (!u) return { browser: "Unbekannt", os: "Unbekannt", device: "desktop" };

  // OS
  let os = "Unbekannt";
  if (u.includes("windows")) os = "Windows";
  else if (u.includes("mac os x") || u.includes("macintosh")) os = "macOS";
  else if (u.includes("android")) os = "Android";
  else if (u.includes("iphone") || u.includes("ipad") || u.includes("ios")) os = "iOS";
  else if (u.includes("linux")) os = "Linux";

  // Browser (Reihenfolge ist wichtig, weil viele UAs mehrere Marker enthalten)
  let browser = "Unbekannt";
  if (u.includes("edg/")) browser = "Edge";
  else if (u.includes("opr/") || u.includes("opera")) browser = "Opera";
  else if (u.includes("samsungbrowser")) browser = "Samsung Internet";
  else if (u.includes("chrome/") && !u.includes("chromium/")) browser = "Chrome";
  else if (u.includes("firefox/")) browser = "Firefox";
  else if (u.includes("safari/") && !u.includes("chrome/")) browser = "Safari";

  // Device
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

// ── Bot-Erkennung ───────────────────────────────────────────────────────────
// Filtert die offensichtlichsten Crawler/Bots. Headless-Chrome o.ä.
// kann nicht zuverlässig serverseitig erkannt werden.

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
  if (!ua) return true; // kein UA → vermutlich Crawler oder Skript
  const u = ua.toLowerCase();
  return BOT_PATTERNS.some((p) => u.includes(p));
}

// ── Hash-Funktionen ─────────────────────────────────────────────────────────
// Identifier sind salzgehasht und rotieren täglich.

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
  // Gleitender 30-Min-Bucket. Beispiel: 14:23 → 28*48 + 28 (idx)
  return Math.floor(date.getTime() / (1000 * 60 * 30));
}

// ── Pfad-Normalisierung ────────────────────────────────────────────────────
// Entfernt Query-String, Tracking-Parameter, Trailing-Slash. Damit gruppieren
// /preise und /preise/?utm_source=foo zur selben Seite.
export function normalizePath(rawPath: string): string {
  if (!rawPath) return "/";
  try {
    const u = new URL(rawPath, "http://x");
    let p = u.pathname;
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p || "/";
  } catch {
    return rawPath;
  }
}

// ── Referrer-Host extrahieren ─────────────────────────────────────────────
export function referrerHost(ref: string | null | undefined): string | null {
  if (!ref) return null;
  try {
    return new URL(ref).host || null;
  } catch {
    return null;
  }
}
