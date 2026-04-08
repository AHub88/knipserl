import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

// DELETE /api/client-logos/[id] — delete logo (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;

  const logo = await prisma.clientLogo.findUnique({ where: { id } });
  if (!logo) {
    return NextResponse.json({ error: "Logo nicht gefunden" }, { status: 404 });
  }

  // Delete file from disk
  try {
    const filePath = path.join(process.cwd(), "uploads", "client-logos", logo.filename);
    await unlink(filePath);
  } catch {
    // File may already be deleted, continue with DB cleanup
  }

  // Delete DB record
  await prisma.clientLogo.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
