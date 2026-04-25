import { NextResponse } from "next/server";
import { getPublicVapidKey } from "@/lib/push";

export async function GET() {
  const key = getPublicVapidKey();
  if (!key) {
    return NextResponse.json(
      { error: "Push nicht konfiguriert — VAPID_PUBLIC_KEY fehlt" },
      { status: 503 },
    );
  }
  return NextResponse.json({ publicKey: key });
}
