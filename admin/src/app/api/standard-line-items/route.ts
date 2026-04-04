import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/standard-line-items
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const items = await prisma.standardLineItem.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return NextResponse.json(items);
}

// POST /api/standard-line-items
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, unitPrice, category, sortOrder } = body;

  if (!title || unitPrice == null) {
    return NextResponse.json({ error: "Titel und Preis sind Pflichtfelder" }, { status: 400 });
  }

  const item = await prisma.standardLineItem.create({
    data: {
      title,
      description: description || null,
      unitPrice: Number(unitPrice),
      category: category || null,
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
