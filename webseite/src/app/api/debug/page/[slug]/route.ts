// Temp-Debug für Mini-CMS-Fetch
import { NextResponse } from "next/server";
import { fetchPageData } from "@/lib/pages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const adminInternal = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;

  const rawInternal = adminInternal
    ? await fetch(`${adminInternal}/api/pages/${slug}`, { cache: "no-store" })
        .then((r) => ({ status: r.status }))
        .catch((e) => ({ error: String(e) }))
    : null;
  const rawPublic = adminPublic
    ? await fetch(`${adminPublic}/api/pages/${slug}`, { cache: "no-store" })
        .then((r) => ({ status: r.status }))
        .catch((e) => ({ error: String(e) }))
    : null;

  const data = await fetchPageData(slug);

  return NextResponse.json({
    slug,
    env: { adminInternal, adminPublic },
    raw: { internal: rawInternal, public: rawPublic },
    fetched: data
      ? {
          slug: data.slug,
          slotCount: Object.keys(data.slots).length,
          impressionCount: data.impressionPhotos.length,
          firstImpressionSrc: data.impressionPhotos[0]?.src ?? null,
        }
      : null,
  });
}
