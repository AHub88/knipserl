import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// PUT /api/pages/[slug]/slots/[key] — set or clear slot
// Body: { mediaAssetId: string | null, altOverride?: string }
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; key: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { slug, key } = await params;
  const { mediaAssetId, altOverride } = (await request.json()) as {
    mediaAssetId: string | null;
    altOverride?: string;
  };

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return NextResponse.json({ error: "Seite nicht gefunden" }, { status: 404 });

  await prisma.pageImageSlot.upsert({
    where: { pageId_slotKey: { pageId: page.id, slotKey: key } },
    create: {
      pageId: page.id,
      slotKey: key,
      mediaAssetId: mediaAssetId || null,
      altOverride: altOverride ?? "",
    },
    update: {
      mediaAssetId: mediaAssetId || null,
      altOverride: typeof altOverride === "string" ? altOverride : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
