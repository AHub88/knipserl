import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// POST /api/impressions/reorder — update sortOrder for a list of photo IDs
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { ids } = (await request.json()) as { ids: string[] };
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids muss Array sein" }, { status: 400 });
  }

  await prisma.$transaction(
    ids.map((id, idx) =>
      prisma.impressionPhoto.update({
        where: { id },
        data: { sortOrder: idx },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
