import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public endpoint — used by the website to display reviews (DSGVO-safe: no Google traffic)
export async function GET() {
  const reviews = await prisma.googleReview.findMany({
    where: { active: true },
    orderBy: { time: "desc" },
  });

  // Get Google's total count and average from settings (more accurate than local count)
  const settings = await prisma.appSetting.findMany({
    where: { key: { in: ["googleReviewsTotalCount", "googleReviewsAvgRating"] } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      text: r.text,
      time: r.time.toISOString(),
    })),
    totalCount: Number(map.googleReviewsTotalCount) || reviews.length,
    averageRating: Number(map.googleReviewsAvgRating) || 5,
  });
}
