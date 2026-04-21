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
          "googleBusinessAccountName",
          "googleBusinessLocationName",
        ],
      },
    },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const hasOAuth = !!map.googleRefreshToken;
  const placeId = map.googlePlaceId;
  const apiKey = map.googleApiKey;
  const cachedAccountName = map.googleBusinessAccountName;
  const cachedLocationName = map.googleBusinessLocationName;

  async function cacheGbpIds(accountName: string, locationName: string) {
    await prisma.appSetting.upsert({
      where: { key: "googleBusinessAccountName" },
      update: { value: accountName },
      create: { key: "googleBusinessAccountName", value: accountName },
    });
    await prisma.appSetting.upsert({
      where: { key: "googleBusinessLocationName" },
      update: { value: locationName },
      create: { key: "googleBusinessLocationName", value: locationName },
    });
  }

  async function fetchFromPlacesApi() {
    if (!apiKey || !placeId) {
      throw new Error("Weder OAuth noch API Key + Place ID konfiguriert");
    }
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=rating,userRatingCount,reviews&languageCode=de`,
      { headers: { "X-Goog-Api-Key": apiKey } }
    );
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message ?? `HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      reviews: (data.reviews ?? []).map((r: any) => ({
        authorName: r.authorAttribution?.displayName ?? "Anonym",
        rating: r.rating ?? 5,
        text: r.text?.text ?? "",
        time: new Date(r.publishTime),
      })) as { authorName: string; rating: number; text: string; time: Date }[],
      totalRatings: (data.userRatingCount ?? 0) as number,
      overallRating: (data.rating ?? 0) as number,
    };
  }

  try {
    let reviews: { authorName: string; rating: number; text: string; time: Date }[];
    let totalRatings: number;
    let overallRating: number;
    let source: string;
    let notice: string | undefined;

    if (hasOAuth) {
      try {
        // ── Google Business Profile API (all reviews) ──
        const accessToken = await getAccessToken();
        let accountName = cachedAccountName;
        let locationName = cachedLocationName;

        if (!accountName || !locationName) {
          accountName = await getAccountId(accessToken);
          locationName = await getLocationName(accessToken, accountName, placeId);
          await cacheGbpIds(accountName, locationName);
        }

        try {
          const result = await fetchAllReviews(accessToken, accountName, locationName);
          reviews = result.reviews;
          totalRatings = result.totalCount;
          overallRating = result.averageRating;
          source = "Google Business Profile API";
        } catch (fetchErr: any) {
          if (cachedAccountName || cachedLocationName) {
            accountName = await getAccountId(accessToken);
            locationName = await getLocationName(accessToken, accountName, placeId);
            await cacheGbpIds(accountName, locationName);
            const result = await fetchAllReviews(accessToken, accountName, locationName);
            reviews = result.reviews;
            totalRatings = result.totalCount;
            overallRating = result.averageRating;
            source = "Google Business Profile API";
          } else {
            throw fetchErr;
          }
        }
      } catch (gbpErr: any) {
        // GBP blockiert (Quota / Fehlende API-Freischaltung) -> Fallback Places API
        if (apiKey && placeId) {
          const fallback = await fetchFromPlacesApi();
          reviews = fallback.reviews;
          totalRatings = fallback.totalRatings;
          overallRating = fallback.overallRating;
          source = "Places API (Fallback, max 5)";
          notice = `Google Business Profile API nicht verfuegbar: ${gbpErr.message ?? gbpErr}. Auf Places API (max 5 Reviews) zurueckgegriffen.`;
        } else {
          throw gbpErr;
        }
      }
    } else if (apiKey && placeId) {
      const fallback = await fetchFromPlacesApi();
      reviews = fallback.reviews;
      totalRatings = fallback.totalRatings;
      overallRating = fallback.overallRating;
      source = "Places API (max 5)";
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
      source,
      notice,
      imported,
      updated: reviews.length - imported,
      total: reviews.length,
      totalFromGoogle: totalRatings,
      ratingFromGoogle: overallRating,
    });
  } catch (err: any) {
    const msg = err.message ?? "Sync fehlgeschlagen";
    const isQuota = /quota.*exceeded/i.test(msg);
    const friendly = isQuota
      ? `Google API-Quota aufgebraucht. Die Google Business Profile API hat im Default-Quota meist 0 Requests/Tag, bis sie explizit freigeschaltet wird. Loesung: Google Cloud Console -> APIs & Services -> My Business Account Management API -> Quotas -> Request increase. Als Fallback bitte API Key + Place ID in Einstellungen hinterlegen, dann werden bis zu 5 Reviews ueber die Places API importiert. Roh: ${msg}`
      : msg;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
