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
    // Fetch reviews from Google Places API (server-side only, no user data sent)
    const params = new URLSearchParams({
      place_id: placeId,
      fields: "reviews,rating,user_ratings_total",
      language: "de",
      key: apiKey,
    });

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Google API Fehler: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: `Google API Status: ${data.status} — ${data.error_message ?? ""}` },
        { status: 502 }
      );
    }

    const googleReviews = data.result?.reviews ?? [];
    const totalRatings = data.result?.user_ratings_total ?? 0;
    const overallRating = data.result?.rating ?? 0;

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

    // Upsert reviews (match by author name + approximate time to avoid duplicates)
    let imported = 0;
    for (const review of googleReviews) {
      const authorName = review.author_name ?? "Anonym";
      const rating = review.rating ?? 5;
      const text = review.text ?? "";
      const time = new Date(review.time * 1000); // Google returns unix timestamp

      // Check if review from same author with same rating already exists
      const existing = await prisma.googleReview.findFirst({
        where: { authorName, rating },
      });

      if (existing) {
        // Update text if changed
        await prisma.googleReview.update({
          where: { id: existing.id },
          data: { text, time },
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
