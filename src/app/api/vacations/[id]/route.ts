import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { id } = await params;
  const vacation = await prisma.vacation.findUnique({ where: { id } });

  if (!vacation) {
    return NextResponse.json({ error: "Urlaub nicht gefunden" }, { status: 404 });
  }

  if (session.user.role === "DRIVER" && vacation.driverId !== session.user.id) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  await prisma.vacation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
