import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const layoutDesign = await prisma.layoutDesign.findUnique({
    where: { token },
    select: { orderId: true },
  });
  if (!layoutDesign) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 404 });
  }
  const order = { id: layoutDesign.orderId };

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Nur PNG, JPG und WebP erlaubt" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Datei darf maximal 5MB groß sein" },
      { status: 400 }
    );
  }

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    order.id,
    "design"
  );
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop() ?? "png";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const url = `/uploads/${order.id}/design/${filename}`;

  return NextResponse.json({ url }, { status: 201 });
}
