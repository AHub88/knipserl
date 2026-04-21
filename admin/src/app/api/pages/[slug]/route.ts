import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findPageDefinition } from "@/lib/page-definitions";
import { buildUrls } from "@/lib/impression-images";

export const runtime = "nodejs";

// GET /api/pages/[slug] — fetch page with its slots + impression photos
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const def = findPageDefinition(slug);
  if (!def) return NextResponse.json({ error: "Unbekannte Seite" }, { status: 404 });

  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      imageSlots: { include: { mediaAsset: true } },
      impressionPhotos: {
        orderBy: { sortOrder: "asc" },
        include: { mediaAsset: true },
      },
    },
  });
  if (!page) return NextResponse.json({ error: "Seite nicht in DB" }, { status: 404 });

  const slots = def.slots.map((slotDef) => {
    const existing = page.imageSlots.find((s) => s.slotKey === slotDef.key);
    const asset = existing?.mediaAsset ?? null;
    return {
      key: slotDef.key,
      label: slotDef.label,
      description: slotDef.description ?? null,
      aspectRatio: slotDef.aspectRatio ?? null,
      altOverride: existing?.altOverride ?? "",
      asset: asset
        ? {
            id: asset.id,
            alt: asset.alt,
            width: asset.width,
            height: asset.height,
            originalFilename: asset.originalFilename,
            urls: buildUrls(asset.originalFilename, asset.width, asset.originalFilename.endsWith(".gif")),
          }
        : null,
    };
  });

  const impressionPhotos = page.impressionPhotos
    .filter((ip) => ip.mediaAsset.active)
    .map((ip) => {
      const a = ip.mediaAsset;
      const isAnimated = a.originalFilename.endsWith(".gif");
      return {
        id: a.id,
        alt: a.alt,
        width: a.width,
        height: a.height,
        originalFilename: a.originalFilename,
        urls: buildUrls(a.originalFilename, a.width, isAnimated),
      };
    });

  return NextResponse.json({
    slug: page.slug,
    title: page.title,
    category: page.category,
    hasImpressionSection: def.hasImpressionSection,
    slots,
    impressionPhotos,
  });
}
