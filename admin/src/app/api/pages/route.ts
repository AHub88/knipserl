import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncPagesFromDefinitions } from "@/lib/pages";
import { PAGE_DEFINITIONS } from "@/lib/page-definitions";

export const runtime = "nodejs";

// GET /api/pages — list all pages (with definition info merged in)
export async function GET() {
  await syncPagesFromDefinitions();
  const pages = await prisma.page.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: {
      _count: { select: { imageSlots: true, impressionPhotos: true } },
    },
  });

  return NextResponse.json({
    pages: pages.map((p) => {
      const def = PAGE_DEFINITIONS.find((d) => d.slug === p.slug);
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        sortOrder: p.sortOrder,
        slotCount: def?.slots.length ?? 0,
        filledSlotCount: p._count.imageSlots,
        impressionCount: p._count.impressionPhotos,
        hasImpressionSection: def?.hasImpressionSection ?? false,
      };
    }),
  });
}
