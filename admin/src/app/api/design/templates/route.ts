import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
