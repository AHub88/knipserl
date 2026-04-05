import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

type RouteContext = { params: Promise<{ token: string }> };

async function getDesignAndOrder(token: string) {
  const ld = await prisma.layoutDesign.findUnique({ where: { token } });
  if (!ld) return null;
  const order = await prisma.order.findUnique({ where: { id: ld.orderId } });
  if (!order) return null;
  return { layoutDesign: ld, order };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { token } = await params;

  const result = await getDesignAndOrder(token);
  if (!result) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 404 });
  }

  const { order, layoutDesign } = result;

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

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      eventType: order.eventType,
      eventDate: order.eventDate,
      locationName: order.locationName,
    },
    design: layoutDesign,
    templates,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  const { token } = await params;

  const ld = await prisma.layoutDesign.findUnique({ where: { token } });
  if (!ld) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 404 });
  }

  const body = await request.json();
  const { canvasJson } = body;

  if (!canvasJson || typeof canvasJson !== "object") {
    return NextResponse.json(
      { error: "canvasJson ist erforderlich" },
      { status: 400 }
    );
  }

  const design = await prisma.layoutDesign.update({
    where: { id: ld.id },
    data: { canvasJson },
  });

  return NextResponse.json({ design });
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  const { token } = await params;

  const result = await getDesignAndOrder(token);
  if (!result) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 404 });
  }

  const { order, layoutDesign } = result;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "PNG-Datei ist erforderlich" },
      { status: 400 }
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", order.id);
  await mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, "layout-final.png");
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const graphicUrl = `/uploads/${order.id}/layout-final.png`;

  await prisma.order.update({
    where: { id: order.id },
    data: { graphicUrl, designReady: true },
  });

  const design = await prisma.layoutDesign.update({
    where: { id: layoutDesign.id },
    data: { exportUrl: graphicUrl, submitted: true, submittedAt: new Date() },
  });

  return NextResponse.json({ design, graphicUrl }, { status: 201 });
}
