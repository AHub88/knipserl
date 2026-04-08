import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public endpoint — used by the website to display reviews (DSGVO-safe: no Google traffic)
export async function GET() {
  const reviews = await prisma.googleReview.findMany({
    where: { active: true },
    orderBy: { time: "desc" },
  });

  // Calculate aggregate
  const count = reviews.length;
  const avgRating =
    count > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0;

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      text: r.text,
      time: r.time.toISOString(),
    })),
    totalCount: count,
    averageRating: avgRating,
  });
}
