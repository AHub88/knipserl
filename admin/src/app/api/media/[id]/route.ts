import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteProcessed } from "@/lib/impression-images";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const data: { alt?: string; active?: boolean } = {};
  if (typeof body.alt === "string") data.alt = body.alt.trim();
  if (typeof body.active === "boolean") data.active = body.active;

  const asset = await prisma.mediaAsset.update({ where: { id }, data });
  return NextResponse.json({ id: asset.id, alt: asset.alt, active: asset.active });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  // Check if asset is used anywhere
  const [slotCount, impressionCount] = await Promise.all([
    prisma.pageImageSlot.count({ where: { mediaAssetId: id } }),
    prisma.pageImpressionPhoto.count({ where: { mediaAssetId: id } }),
  ]);

  if (slotCount > 0 || impressionCount > 0) {
    return NextResponse.json(
      {
        error: `Bild wird noch verwendet: ${slotCount} Bild-Slot${slotCount === 1 ? "" : "s"}, ${impressionCount} Impressionen-Zuordnung${impressionCount === 1 ? "" : "en"}. Bitte erst aus den Seiten entfernen.`,
      },
      { status: 409 }
    );
  }

  await prisma.mediaAsset.delete({ where: { id } });
  await deleteProcessed(asset.originalFilename);

  return NextResponse.json({ ok: true });
}
