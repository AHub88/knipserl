import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const settings = await prisma.appSetting.findMany({
    where: { key: { in: ["googleOAuthClientId"] } },
  });
  const clientId = settings.find((s) => s.key === "googleOAuthClientId")?.value;

  if (!clientId) {
    return NextResponse.redirect(new URL("/settings?error=oauth_not_configured", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/google-oauth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/business.manage",
    access_type: "offline",
    prompt: "consent",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
