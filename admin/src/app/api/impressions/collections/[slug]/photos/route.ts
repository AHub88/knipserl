import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// PUT /api/impressions/collections/[slug]/photos — replace membership with ordered list
// Body: { ids: string[] }  (photo IDs in desired order)
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

  const collection = await prisma.impressionCollection.findUnique({ where: { slug } });
  if (!collection) {
    return NextResponse.json({ error: "Collection nicht gefunden" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.impressionCollectionPhoto.deleteMany({ where: { collectionId: collection.id } }),
    ...ids.map((photoId, idx) =>
      prisma.impressionCollectionPhoto.create({
        data: { collectionId: collection.id, photoId, sortOrder: idx },
      })
    ),
  ]);

  return NextResponse.json({ ok: true, count: ids.length });
}
