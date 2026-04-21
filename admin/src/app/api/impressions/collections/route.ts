import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/impressions/collections — list all
export async function GET() {
  const collections = await prisma.impressionCollection.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { photos: true } } },
  });
  return NextResponse.json({
    collections: collections.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      photoCount: c._count.photos,
    })),
  });
}

// POST /api/impressions/collections — create
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const body = await request.json();
  const name = (body.name ?? "").trim();
  const slug = (body.slug ?? "").trim() || slugify(name);
  const description = (body.description ?? "").trim();

  if (!name) return NextResponse.json({ error: "Name ist Pflicht" }, { status: 400 });
  if (!slug) return NextResponse.json({ error: "Slug konnte nicht erzeugt werden" }, { status: 400 });

  const existing = await prisma.impressionCollection.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: `Slug "${slug}" ist bereits vergeben` }, { status: 409 });

  const collection = await prisma.impressionCollection.create({
    data: { slug, name, description },
  });

  return NextResponse.json(
    { id: collection.id, slug: collection.slug, name: collection.name, description: collection.description, photoCount: 0 },
    { status: 201 }
  );
}
