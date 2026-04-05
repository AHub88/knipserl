import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

type RouteContext = { params: Promise<{ token: string }> };

async function getLayoutDesignByToken(token: string) {
  return prisma.layoutDesign.findUnique({
    where: { token },
    include: { order: true },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { token } = await params;

  const layoutDesign = await getLayoutDesignByToken(token);
  if (!layoutDesign) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 404 });
  }

  const order = layoutDesign.order;

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

  const layoutDesign = await getLayoutDesignByToken(token);
  if (!layoutDesign) {
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
    where: { id: layoutDesign.id },
    data: { canvasJson },
  });

  return NextResponse.json({ design });
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  const { token } = await params;

  const layoutDesign = await getLayoutDesignByToken(token);
  if (!layoutDesign) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 404 });
  }

  const order = layoutDesign.order;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "PNG-Datei ist erforderlich" },
      { status: 400 }
    );
  }

  // Save PNG to public/uploads/{orderId}/layout-final.png
  const uploadDir = path.join(process.cwd(), "public", "uploads", order.id);
  await mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, "layout-final.png");
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const graphicUrl = `/uploads/${order.id}/layout-final.png`;

  // Update order
  await prisma.order.update({
    where: { id: order.id },
    data: {
      graphicUrl,
      designReady: true,
    },
  });

  // Update LayoutDesign
  const design = await prisma.layoutDesign.update({
    where: { id: layoutDesign.id },
    data: {
      exportUrl: graphicUrl,
      submitted: true,
      submittedAt: new Date(),
    },
  });

  return NextResponse.json({ design, graphicUrl }, { status: 201 });
}
