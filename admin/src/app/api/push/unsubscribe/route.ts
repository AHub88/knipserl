import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const schema = z.object({
  endpoint: z.string().url(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    await prisma.pushSubscription.deleteMany({
      where: { endpoint: data.endpoint, userId: session.user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[push unsubscribe]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
