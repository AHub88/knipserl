import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);
    const userAgent = request.headers.get("user-agent") ?? null;

    const sub = await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: {
        userId: session.user.id,
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        userAgent,
      },
      update: {
        userId: session.user.id,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        userAgent,
      },
    });

    return NextResponse.json({ id: sub.id }, { status: 201 });
  } catch (error) {
    console.error("[push subscribe]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
