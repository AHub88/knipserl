import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildUrls } from "@/lib/impression-images";

export const runtime = "nodejs";

// GET /api/impressions/collections/[slug] — fetch collection with photos
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const collection = await prisma.impressionCollection.findUnique({
    where: { slug },
    include: {
      photos: {
        orderBy: { sortOrder: "asc" },
        include: { photo: true },
      },
    },
  });

  if (!collection) {
    return NextResponse.json({ error: "Collection nicht gefunden" }, { status: 404 });
  }

  const photos = collection.photos
    .filter((cp) => cp.photo.active)
    .map((cp) => {
      const p = cp.photo;
      const isAnimated = p.originalFilename.endsWith(".gif");
      return {
        id: p.id,
        alt: p.alt,
        width: p.width,
        height: p.height,
        originalFilename: p.originalFilename,
        urls: buildUrls(p.originalFilename, p.width, isAnimated),
      };
    });

  return NextResponse.json({
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    description: collection.description,
    photos,
  });
}

// PATCH — update name/description/slug
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { slug } = await params;
  const body = await request.json();
  const data: { name?: string; description?: string; slug?: string } = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.description === "string") data.description = body.description.trim();
  if (typeof body.slug === "string" && body.slug.trim()) data.slug = body.slug.trim();

  const updated = await prisma.impressionCollection.update({
    where: { slug },
    data,
  });
  return NextResponse.json({ slug: updated.slug, name: updated.name, description: updated.description });
}

// DELETE — remove collection (photos unchanged, only membership removed via cascade)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { slug } = await params;
  await prisma.impressionCollection.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
