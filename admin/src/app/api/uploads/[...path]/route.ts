import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  ttf: "font/ttf",
  otf: "font/otf",
  woff: "font/woff",
  woff2: "font/woff2",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = await params;
  const filePath = segments.path.join("/");

  // Prevent path traversal
  if (filePath.includes("..")) {
    return NextResponse.json({ error: "Ungültiger Pfad" }, { status: 400 });
  }

  const absolutePath = path.join(process.cwd(), "uploads", filePath);

  try {
    await stat(absolutePath);
  } catch {
    return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });
  }

  const ext = path.extname(absolutePath).slice(1).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const fileBuffer = await readFile(absolutePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
