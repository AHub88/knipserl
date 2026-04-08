import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  getAccessToken,
  getAccountId,
  getLocationName,
  fetchAllReviews,
} from "@/lib/google-business";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const settings = await prisma.appSetting.findMany({
    where: {
      key: {
        in: [
          "googleApiKey",
          "googlePlaceId",
          "googleRefreshToken",
        ],
      },
    },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const hasOAuth = !!map.googleRefreshToken;
  const placeId = map.googlePlaceId;
  const apiKey = map.googleApiKey;

  try {
    let reviews: { authorName: string; rating: number; text: string; time: Date }[];
    let totalRatings: number;
    let overallRating: number;

    if (hasOAuth) {
      // ── Google Business Profile API (all reviews) ──
      const accessToken = await getAccessToken();
      const accountName = await getAccountId(accessToken);
      const locationName = await getLocationName(accessToken, accountName, placeId);
      const result = await fetchAllReviews(accessToken, accountName, locationName);

      reviews = result.reviews;
      totalRatings = result.totalCount;
      overallRating = result.averageRating;
    } else if (apiKey && placeId) {
      // ── Fallback: Places API New (max 5 reviews) ──
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=rating,userRatingCount,reviews&languageCode=de`,
        { headers: { "X-Goog-Api-Key": apiKey } }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      totalRatings = data.userRatingCount ?? 0;
      overallRating = data.rating ?? 0;

      reviews = (data.reviews ?? []).map((r: any) => ({
        authorName: r.authorAttribution?.displayName ?? "Anonym",
        rating: r.rating ?? 5,
        text: r.text?.text ?? "",
        time: new Date(r.publishTime),
      }));
    } else {
      return NextResponse.json(
        { error: "Weder OAuth noch API Key + Place ID konfiguriert" },
        { status: 400 }
      );
    }

    // Store aggregate data
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

    // Upsert reviews
    let imported = 0;
    for (const review of reviews) {
      const existing = await prisma.googleReview.findFirst({
        where: { authorName: review.authorName },
      });

      if (existing) {
        await prisma.googleReview.update({
          where: { id: existing.id },
          data: { text: review.text, rating: review.rating, time: review.time },
        });
      } else {
        await prisma.googleReview.create({
          data: {
            authorName: review.authorName,
            rating: review.rating,
            text: review.text,
            time: review.time,
          },
        });
        imported++;
      }
    }

    return NextResponse.json({
      ok: true,
      source: hasOAuth ? "Google Business Profile API" : "Places API (max 5)",
      imported,
      updated: reviews.length - imported,
      total: reviews.length,
      totalFromGoogle: totalRatings,
      ratingFromGoogle: overallRating,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Sync fehlgeschlagen" },
      { status: 500 }
    );
  }
}
