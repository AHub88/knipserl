import { NextResponse } from "next/server";

// Proxy endpoint — fetches travel pricing tiers from admin backend
export async function GET() {
  const adminUrl = process.env.ADMIN_API_URL || process.env.ADMIN_PUBLIC_URL;
  if (!adminUrl) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(`${adminUrl}/api/travel-pricing/public`, { cache: "no-store" });
    if (!res.ok) return NextResponse.json([]);
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json([]);
  }
}
