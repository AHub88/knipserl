import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { token } = await params;

  const ld = await prisma.layoutDesign.findUnique({ where: { token } });
  if (!ld) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const order = await prisma.order.findUnique({ where: { id: ld.orderId } });
  if (!order) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const preview = formData.get("preview") as File | null;
  const canvasJson = formData.get("canvasJson") as string | null;

  if (!file) {
    return NextResponse.json({ error: "PNG-Datei ist erforderlich" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "uploads", order.id);
  await mkdir(uploadDir, { recursive: true });

  // Overwrite final PNG
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, "layout-final.png"), buffer);

  // Overwrite preview PNG
  if (preview) {
    const previewBuffer = Buffer.from(await preview.arrayBuffer());
    await writeFile(path.join(uploadDir, "layout-preview.png"), previewBuffer);
  }

  // Update canvas JSON if provided
  if (canvasJson) {
    await prisma.layoutDesign.update({
      where: { id: ld.id },
      data: { canvasJson: JSON.parse(canvasJson) },
    });
  }

  return NextResponse.json({ ok: true });
}
