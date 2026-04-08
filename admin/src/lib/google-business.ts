import { prisma } from "@/lib/db";

/**
 * Get a fresh access token using the stored refresh token
 */
export async function getAccessToken(): Promise<string> {
  const settings = await prisma.appSetting.findMany({
    where: {
      key: {
        in: ["googleOAuthClientId", "googleOAuthClientSecret", "googleRefreshToken"],
      },
    },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const clientId = map.googleOAuthClientId;
  const clientSecret = map.googleOAuthClientSecret;
  const refreshToken = map.googleRefreshToken;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth nicht konfiguriert — bitte unter Einstellungen verbinden");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Token-Refresh fehlgeschlagen: ${data.error_description ?? data.error ?? "Unbekannt"}`);
  }

  return data.access_token;
}

/**
 * Find the GBP account ID
 */
export async function getAccountId(accessToken: string): Promise<string> {
  const res = await fetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Accounts-Abfrage fehlgeschlagen: ${data.error?.message ?? res.status}`);
  }

  const accounts = data.accounts ?? [];
  if (accounts.length === 0) {
    throw new Error("Kein Google Business Profil gefunden für dieses Google-Konto");
  }

  // Return the first account's name (format: "accounts/123456")
  return accounts[0].name;
}

/**
 * Find the location for a given account (auto-detect by matching Place ID or use first)
 */
export async function getLocationName(
  accessToken: string,
  accountName: string,
  placeId?: string
): Promise<string> {
  const res = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,metadata`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Locations-Abfrage fehlgeschlagen: ${data.error?.message ?? res.status}`);
  }

  const locations = data.locations ?? [];
  if (locations.length === 0) {
    throw new Error("Keine Locations im Google Business Profil gefunden");
  }

  // Try to match by Place ID
  if (placeId) {
    const match = locations.find(
      (loc: any) => loc.metadata?.placeId === placeId
    );
    if (match) return match.name;
  }

  // Fallback: first location
  return locations[0].name;
}

type GbpReview = {
  authorName: string;
  rating: number;
  text: string;
  time: Date;
};

/**
 * Fetch ALL reviews paginated from Google Business Profile API
 */
export async function fetchAllReviews(
  accessToken: string,
  accountName: string,
  locationName: string
): Promise<{ reviews: GbpReview[]; averageRating: number; totalCount: number }> {
  const allReviews: GbpReview[] = [];
  let pageToken: string | undefined;
  let averageRating = 0;
  let totalCount = 0;

  do {
    const url = new URL(
      `https://mybusiness.googleapis.com/v4/${accountName}/${locationName}/reviews`
    );
    url.searchParams.set("pageSize", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Reviews-Abfrage fehlgeschlagen: ${data.error?.message ?? res.status}`);
    }

    averageRating = data.averageRating ?? averageRating;
    totalCount = data.totalReviewCount ?? totalCount;

    for (const review of data.reviews ?? []) {
      allReviews.push({
        authorName: review.reviewer?.displayName ?? "Anonym",
        rating: ratingToNumber(review.starRating),
        text: review.comment ?? "",
        time: new Date(review.createTime),
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return { reviews: allReviews, averageRating, totalCount };
}

function ratingToNumber(starRating: string): number {
  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return map[starRating] ?? 5;
}
