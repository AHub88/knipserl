import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/settings?error=oauth_denied`, baseUrl)
    );
  }

  // Get OAuth credentials from DB
  const settings = await prisma.appSetting.findMany({
    where: { key: { in: ["googleOAuthClientId", "googleOAuthClientSecret"] } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const clientId = map.googleOAuthClientId;
  const clientSecret = map.googleOAuthClientSecret;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(`/settings?error=oauth_not_configured`, baseUrl)
    );
  }

  const redirectUri = `${baseUrl}/api/google-oauth/callback`;

  // Exchange auth code for tokens
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.refresh_token) {
      console.error("[google-oauth] Token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL(`/settings?error=token_exchange_failed`, baseUrl)
      );
    }

    // Store refresh token in DB
    await prisma.appSetting.upsert({
      where: { key: "googleRefreshToken" },
      update: { value: tokenData.refresh_token },
      create: { key: "googleRefreshToken", value: tokenData.refresh_token },
    });

    // Also store the initial access token temporarily for immediate use
    await prisma.appSetting.upsert({
      where: { key: "googleAccessToken" },
      update: { value: tokenData.access_token },
      create: { key: "googleAccessToken", value: tokenData.access_token },
    });

    return NextResponse.redirect(
      new URL(`/google-reviews?success=connected`, baseUrl)
    );
  } catch (err: any) {
    console.error("[google-oauth] Error:", err.message);
    return NextResponse.redirect(
      new URL(`/settings?error=oauth_error`, baseUrl)
    );
  }
}
