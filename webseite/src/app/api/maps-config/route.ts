import { NextResponse } from "next/server";

// Proxy endpoint — fetches Google Maps API key from admin backend
// Uses server-side ADMIN_API_URL (not NEXT_PUBLIC_) so it works at runtime
export async function GET() {
  const adminUrl = process.env.ADMIN_API_URL || process.env.ADMIN_PUBLIC_URL;
  if (!adminUrl) {
    return NextResponse.json({ apiKey: null });
  }

  try {
    const res = await fetch(`${adminUrl}/api/maps-config`, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ apiKey: null });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ apiKey: null });
  }
}
