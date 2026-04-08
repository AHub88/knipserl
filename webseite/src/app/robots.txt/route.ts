import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export function GET() {
  const isProduction = process.env.SITE_ENV !== "staging";

  const body = isProduction
    ? `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml`
    : `User-agent: *
Disallow: /`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
