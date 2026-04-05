import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Dateityp nicht erlaubt" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Datei zu groß (max 10MB)" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "png";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "uploads", "design-assets");
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/api/uploads/design-assets/${filename}` }, { status: 201 });
}
