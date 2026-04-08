import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  // Get API key and Place ID from settings
  const settings = await prisma.appSetting.findMany({
    where: { key: { in: ["googleApiKey", "googlePlaceId"] } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const apiKey = map.googleApiKey;
  const placeId = map.googlePlaceId;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Google API Key nicht konfiguriert (Einstellungen → Google API)" },
      { status: 400 }
    );
  }
  if (!placeId) {
    return NextResponse.json(
      { error: "Google Place ID nicht konfiguriert (Einstellungen → Google API)" },
      { status: 400 }
    );
  }

  try {
    // Fetch reviews from Google Places API (New) — server-side only, DSGVO-safe
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,rating,userRatingCount,reviews&languageCode=de`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
        },
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error?.message ?? `HTTP ${res.status}`;
      return NextResponse.json(
        { error: `Google API Fehler: ${msg}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    const googleReviews = data.reviews ?? [];
    const totalRatings = data.userRatingCount ?? 0;
    const overallRating = data.rating ?? 0;

    // Store total count and rating in AppSettings for the website
    await prisma.appSetting.upsert({
      where: { key: "googleReviewsTotalCount" },
      update: { value: String(totalRatings) },
      create: { key: "googleReviewsTotalCount", value: String(totalRatings) },
    });
    await prisma.appSetting.upsert({
      where: { key: "googleReviewsAvgRating" },
      update: { value: String(overallRating) },
      create: { key: "googleReviewsAvgRating", value: String(overallRating) },
    });

    // Upsert reviews (match by author name + publish time to avoid duplicates)
    let imported = 0;
    for (const review of googleReviews) {
      const authorName = review.authorAttribution?.displayName ?? "Anonym";
      const rating = review.rating ?? 5;
      const text = review.text?.text ?? "";
      const time = new Date(review.publishTime);

      // Check if review from same author already exists
      const existing = await prisma.googleReview.findFirst({
        where: { authorName },
      });

      if (existing) {
        // Update text/rating/time if changed
        await prisma.googleReview.update({
          where: { id: existing.id },
          data: { text, rating, time },
        });
      } else {
        await prisma.googleReview.create({
          data: { authorName, rating, text, time },
        });
        imported++;
      }
    }

    return NextResponse.json({
      ok: true,
      imported,
      updated: googleReviews.length - imported,
      totalFromGoogle: totalRatings,
      ratingFromGoogle: overallRating,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Sync fehlgeschlagen: ${err.message}` },
      { status: 500 }
    );
  }
}
