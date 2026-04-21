// TEMP-Debug-Endpoint: zeigt, was fetchPageData("impressionen") auf der Webseite sieht.
// Wird nach Verifikation des Mini-CMS wieder entfernt.

import { NextResponse } from "next/server";
import { fetchPageData } from "@/lib/pages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const adminInternal = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;

  let internalTest: { url: string; status: number | null; error: string | null } | null = null;
  if (adminInternal) {
    try {
      const res = await fetch(`${adminInternal}/api/pages/impressionen`, { cache: "no-store" });
      internalTest = { url: `${adminInternal}/api/pages/impressionen`, status: res.status, error: null };
    } catch (e) {
      internalTest = {
        url: `${adminInternal}/api/pages/impressionen`,
        status: null,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  let publicTest: { url: string; status: number | null; error: string | null } | null = null;
  if (adminPublic) {
    try {
      const res = await fetch(`${adminPublic}/api/pages/impressionen`, { cache: "no-store" });
      publicTest = { url: `${adminPublic}/api/pages/impressionen`, status: res.status, error: null };
    } catch (e) {
      publicTest = {
        url: `${adminPublic}/api/pages/impressionen`,
        status: null,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  const data = await fetchPageData("impressionen");

  return NextResponse.json({
    env: {
      ADMIN_API_URL: adminInternal ?? null,
      ADMIN_PUBLIC_URL: adminPublic ?? null,
    },
    rawFetchTests: { internal: internalTest, public: publicTest },
    fetchPageDataResult: data
      ? {
          slug: data.slug,
          slotCount: Object.keys(data.slots).length,
          impressionCount: data.impressionPhotos.length,
          firstImage: data.impressionPhotos[0] ?? null,
        }
      : null,
  });
}
