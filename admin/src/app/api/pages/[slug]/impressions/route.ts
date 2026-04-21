import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// PUT /api/pages/[slug]/impressions — replace impression photo list (atomically)
// Body: { ids: string[] }  (MediaAsset IDs in desired order)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { slug } = await params;
  const { ids } = (await request.json()) as { ids: string[] };
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids muss Array sein" }, { status: 400 });
  }

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return NextResponse.json({ error: "Seite nicht gefunden" }, { status: 404 });

  await prisma.$transaction([
    prisma.pageImpressionPhoto.deleteMany({ where: { pageId: page.id } }),
    ...ids.map((mediaAssetId, idx) =>
      prisma.pageImpressionPhoto.create({
        data: { pageId: page.id, mediaAssetId, sortOrder: idx },
      })
    ),
  ]);

  return NextResponse.json({ ok: true, count: ids.length });
}
