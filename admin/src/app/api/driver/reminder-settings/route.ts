import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { reminderEmailEnabled: true, reminderLeadDays: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
  }
  return NextResponse.json(user);
}

const patchSchema = z.object({
  reminderEmailEnabled: z.boolean().optional(),
  reminderLeadDays: z.number().int().min(0).max(14).optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = patchSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { reminderEmailEnabled: true, reminderLeadDays: true, email: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[reminder-settings PATCH]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
