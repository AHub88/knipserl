import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendPushToUser, isPushConfigured } from "@/lib/push";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: "Push nicht konfiguriert — VAPID-Keys fehlen im Server-Env" },
      { status: 503 },
    );
  }

  try {
    const result = await sendPushToUser(session.user.id, {
      title: "Knipserl — Test",
      body: "Push funktioniert. Ab jetzt bekommst du hier Erinnerungen.",
      url: "/driver/dashboard",
      tag: "test",
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[push test]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Interner Serverfehler" },
      { status: 500 },
    );
  }
}
