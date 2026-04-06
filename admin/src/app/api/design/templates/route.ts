import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET /api/design/templates — list active templates (public for editor)
export async function GET() {
  const templates = await prisma.layoutTemplate.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      format: true,
      thumbnail: true,
      canvasJson: true,
      category: true,
    },
  });

  return NextResponse.json({ templates });
}

// POST /api/design/templates — create template (admin only)
// Supports both multipart (file upload) and JSON (canvasJson) body
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  // JSON body path (admin editor sends canvasJson directly)
  if (contentType.includes("application/json")) {
    const body = await request.json();
    const { name, format, category, canvasJson, thumbnail } = body;

    if (!name) {
      return NextResponse.json({ error: "Name ist Pflichtfeld" }, { status: 400 });
    }

    const template = await prisma.layoutTemplate.create({
      data: {
        name,
        format: format || "2x6",
        category: category || null,
        thumbnail: thumbnail || null,
        canvasJson: canvasJson ?? { version: "6.6.1", objects: [] },
      },
    });

    return NextResponse.json(template, { status: 201 });
  }

  // Multipart/form-data path (file upload)
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const format = (formData.get("format") as string) || "2x6";
  const category = formData.get("category") as string | null;
  const file = formData.get("file") as File | null;

  if (!name) {
    return NextResponse.json({ error: "Name ist Pflichtfeld" }, { status: 400 });
  }

  let imageUrl = "";

  if (file && file.size > 0) {
    const ext = path.extname(file.name).toLowerCase() || ".png";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads", "templates");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    imageUrl = `/api/uploads/templates/${filename}`;
  }

  const canvasJson = imageUrl
    ? {
        version: "6.6.1",
        objects: [],
        backgroundImage: {
          type: "Image",
          src: imageUrl,
          scaleX: 1,
          scaleY: 1,
        },
      }
    : { version: "6.6.1", objects: [] };

  const template = await prisma.layoutTemplate.create({
    data: {
      name,
      format,
      category: category || null,
      thumbnail: imageUrl || null,
      canvasJson,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
