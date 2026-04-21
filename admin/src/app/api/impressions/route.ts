import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { processUpload, buildUrls } from "@/lib/impression-images";
import path from "path";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

export const runtime = "nodejs";
export const maxDuration = 60;

// GET /api/impressions — public list (used by webseite)
export async function GET(request: NextRequest) {
  const activeOnly = request.nextUrl.searchParams.get("active") !== "false";

  const photos = await prisma.impressionPhoto.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({
    photos: photos.map((p) => {
      const isAnimated = p.originalFilename.endsWith(".gif");
      return {
        id: p.id,
        alt: p.alt,
        width: p.width,
        height: p.height,
        sortOrder: p.sortOrder,
        active: p.active,
        originalFilename: p.originalFilename,
        urls: buildUrls(p.originalFilename, p.width, isAnimated),
      };
    }),
  });
}

// POST /api/impressions — upload new photo (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const alt = ((formData.get("alt") as string) ?? "").trim();

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Datei zu groß (max 25MB)" }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: "Ungültiger Dateityp (PNG, JPG, WebP, GIF)" },
      { status: 400 }
    );
  }

  const processed = await processUpload(file);

  const maxSort = await prisma.impressionPhoto.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxSort._max.sortOrder ?? -1) + 1;

  const photo = await prisma.impressionPhoto.create({
    data: {
      originalFilename: processed.originalFilename,
      alt,
      width: processed.width,
      height: processed.height,
      sortOrder: nextOrder,
    },
  });

  return NextResponse.json(
    {
      id: photo.id,
      alt: photo.alt,
      width: photo.width,
      height: photo.height,
      sortOrder: photo.sortOrder,
      active: photo.active,
      originalFilename: photo.originalFilename,
      urls: buildUrls(photo.originalFilename, photo.width, processed.isAnimated),
    },
    { status: 201 }
  );
}
