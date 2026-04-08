import { NextResponse } from "next/server";

// Temporary debug endpoint — remove after fixing
export async function GET() {
  const adminUrl = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;
  const siteEnv = process.env.SITE_ENV;

  let logoFetchResult = "not attempted";
  const fetchUrls = [adminUrl, adminPublic].filter(Boolean) as string[];

  for (const url of fetchUrls) {
    try {
      const res = await fetch(`${url}/api/client-logos`, { cache: "no-store" });
      logoFetchResult = `${url} -> ${res.status} (${res.ok ? "OK" : "FAIL"})`;
      if (res.ok) {
        const data = await res.json();
        logoFetchResult += ` -> ${data.logos?.length ?? 0} logos`;
        break;
      }
    } catch (err) {
      logoFetchResult = `${url} -> ERROR: ${err instanceof Error ? err.message : "unknown"}`;
    }
  }

  return NextResponse.json({
    SITE_ENV: siteEnv ?? "NOT SET",
    ADMIN_API_URL: adminUrl ?? "NOT SET",
    ADMIN_PUBLIC_URL: adminPublic ?? "NOT SET",
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV ?? "NOT SET",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "NOT SET",
    logoFetchResult,
  });
}
