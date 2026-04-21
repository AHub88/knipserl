import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { processUpload, buildUrls } from "@/lib/impression-images";
import path from "path";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

export const runtime = "nodejs";
export const maxDuration = 60;

// GET /api/media — list all assets
export async function GET(request: NextRequest) {
  const activeOnly = request.nextUrl.searchParams.get("active") === "true";
  const search = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  const assets = await prisma.mediaAsset.findMany({
    where: {
      ...(activeOnly ? { active: true } : {}),
      ...(search ? { alt: { contains: search, mode: "insensitive" as const } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    assets: assets.map((a) => {
      const isAnimated = a.originalFilename.endsWith(".gif");
      return {
        id: a.id,
        alt: a.alt,
        width: a.width,
        height: a.height,
        fileSize: a.fileSize,
        active: a.active,
        originalFilename: a.originalFilename,
        createdAt: a.createdAt,
        urls: buildUrls(a.originalFilename, a.width, isAnimated),
      };
    }),
  });
}

// POST /api/media — upload
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

  const asset = await prisma.mediaAsset.create({
    data: {
      originalFilename: processed.originalFilename,
      alt,
      width: processed.width,
      height: processed.height,
      fileSize: file.size,
    },
  });

  return NextResponse.json(
    {
      id: asset.id,
      alt: asset.alt,
      width: asset.width,
      height: asset.height,
      fileSize: asset.fileSize,
      active: asset.active,
      originalFilename: asset.originalFilename,
      createdAt: asset.createdAt,
      urls: buildUrls(asset.originalFilename, asset.width, processed.isAnimated),
    },
    { status: 201 }
  );
}
