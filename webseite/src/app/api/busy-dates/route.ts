import { NextRequest, NextResponse } from "next/server";

// Proxy endpoint — fetches busy dates from admin backend
export async function GET(request: NextRequest) {
  const adminUrl = process.env.ADMIN_API_URL || process.env.ADMIN_PUBLIC_URL;
  if (!adminUrl) {
    return NextResponse.json({ busyDates: [] });
  }

  const month = request.nextUrl.searchParams.get("month");
  if (!month) {
    return NextResponse.json({ busyDates: [] });
  }

  try {
    const res = await fetch(`${adminUrl}/api/busy-dates?month=${month}`, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ busyDates: [] });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ busyDates: [] });
  }
}
