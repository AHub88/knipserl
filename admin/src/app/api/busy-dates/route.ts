import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public endpoint — used by the website calendar to show unavailable dates
export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month"); // YYYY-MM format
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "month parameter required (YYYY-MM)" }, { status: 400 });
  }

  const [year, mon] = month.split("-").map(Number);
  const from = new Date(year, mon - 1, 1);
  const to = new Date(year, mon, 0, 23, 59, 59); // last day of month

  // Count inquiries per day (only NEW and ACCEPTED, not REJECTED)
  const inquiries = await prisma.inquiry.findMany({
    where: {
      eventDate: { gte: from, lte: to },
      status: { not: "REJECTED" },
    },
    select: { eventDate: true },
  });

  // Count orders per day (only OPEN and ASSIGNED, not CANCELLED)
  const orders = await prisma.order.findMany({
    where: {
      eventDate: { gte: from, lte: to },
      status: { not: "CANCELLED" },
    },
    select: { eventDate: true },
  });

  // Combine and count per day
  const counts: Record<string, number> = {};
  for (const { eventDate } of [...inquiries, ...orders]) {
    const key = eventDate.toISOString().split("T")[0];
    counts[key] = (counts[key] || 0) + 1;
  }

  // Return dates with 3+ bookings
  const busyDates = Object.entries(counts)
    .filter(([, count]) => count >= 3)
    .map(([date]) => date);

  return NextResponse.json({ busyDates });
}
