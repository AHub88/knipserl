import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/client-logos — list all logos (public, no auth)
export async function GET() {
  const logos = await prisma.$queryRaw<
    { id: string; name: string; filename: string }[]
  >`SELECT id, name, filename FROM client_logos ORDER BY LOWER(name) ASC`;

  return NextResponse.json({
    logos: logos.map((logo) => ({
      id: logo.id,
      name: logo.name,
      filename: logo.filename,
      url: `/api/uploads/client-logos/${logo.filename}`,
    })),
  });
}

// POST /api/client-logos — upload logo (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const file = formData.get("file") as File | null;

  if (!name || !file || file.size === 0) {
    return NextResponse.json(
      { error: "Name und Datei sind Pflichtfelder" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Datei zu groß (max 5MB)" },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: "Ungültiger Dateityp (nur PNG, JPG, WebP, SVG)" },
      { status: 400 }
    );
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type) && file.type !== "application/octet-stream") {
    return NextResponse.json(
      { error: "Ungültiger MIME-Typ" },
      { status: 400 }
    );
  }

  const filename = `${slugify(name)}${ext}`;
  const uploadDir = path.join(process.cwd(), "uploads", "client-logos");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const logo = await prisma.clientLogo.create({
    data: { name, filename },
  });

  return NextResponse.json(
    {
      id: logo.id,
      name: logo.name,
      filename: logo.filename,
      url: `/api/uploads/client-logos/${logo.filename}`,
    },
    { status: 201 }
  );
}
