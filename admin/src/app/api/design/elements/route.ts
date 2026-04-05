import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET /api/design/elements — list active elements
export async function GET() {
  const elements = await prisma.designElement.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ elements });
}

// POST /api/design/elements — create element (admin only, multipart)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string | null;
  const file = formData.get("file") as File | null;

  if (!name || !file || file.size === 0) {
    return NextResponse.json(
      { error: "Name und Datei sind Pflichtfelder" },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name).toLowerCase() || ".png";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const uploadDir = path.join(process.cwd(), "uploads", "elements");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const imageUrl = `/api/uploads/elements/${filename}`;

  const element = await prisma.designElement.create({
    data: {
      name,
      imageUrl,
      category: category || null,
    },
  });

  return NextResponse.json(element, { status: 201 });
}
