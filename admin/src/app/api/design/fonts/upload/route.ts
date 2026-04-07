import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB per font file
const ALLOWED_TYPES = [
  "font/ttf",
  "font/otf",
  "font/woff",
  "font/woff2",
  "application/x-font-ttf",
  "application/x-font-otf",
  "application/font-woff",
  "application/font-woff2",
  "application/octet-stream", // browsers often send this for font files
];
const ALLOWED_EXTENSIONS = [".ttf", ".otf", ".woff", ".woff2"];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "Keine Dateien" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "uploads", "fonts");
  await mkdir(uploadDir, { recursive: true });

  const results: { family: string; id: string }[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      errors.push(`${file.name}: Ungültiger Dateityp (nur .ttf, .otf, .woff, .woff2)`);
      continue;
    }
    if (file.size > MAX_SIZE) {
      errors.push(`${file.name}: Zu groß (max 5MB)`);
      continue;
    }

    // Derive font family name from filename (strip extension, replace separators)
    const baseName = path.basename(file.name, ext);
    const family = baseName
      .replace(/[-_]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2") // CamelCase → spaces
      .replace(/\s+(Regular|Bold|Italic|Light|Medium|SemiBold|ExtraBold|Black|Thin)/gi, "")
      .trim();

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const fileUrl = `/api/uploads/fonts/${filename}`;

    // Detect weight from filename
    const lowerName = baseName.toLowerCase();
    let weight = 400;
    if (lowerName.includes("thin") || lowerName.includes("hairline")) weight = 100;
    else if (lowerName.includes("extralight") || lowerName.includes("ultralight")) weight = 200;
    else if (lowerName.includes("light")) weight = 300;
    else if (lowerName.includes("medium")) weight = 500;
    else if (lowerName.includes("semibold") || lowerName.includes("demibold")) weight = 600;
    else if (lowerName.includes("extrabold") || lowerName.includes("ultrabold")) weight = 800;
    else if (lowerName.includes("black") || lowerName.includes("heavy")) weight = 900;
    else if (lowerName.includes("bold")) weight = 700;

    const style = lowerName.includes("italic") || lowerName.includes("oblique") ? "italic" : "normal";

    const font = await prisma.customFont.create({
      data: { family, category: "custom", fileUrl, weight, style },
    });

    results.push({ family, id: font.id });
  }

  return NextResponse.json({ uploaded: results, errors }, { status: 201 });
}
