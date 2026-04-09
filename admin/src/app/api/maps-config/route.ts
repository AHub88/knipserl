import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public endpoint — returns only the Google Maps API key for Places Autocomplete
export async function GET() {
  const setting = await prisma.appSetting.findUnique({
    where: { key: "googleApiKey" },
  });

  if (!setting?.value) {
    return NextResponse.json({ apiKey: null });
  }

  return NextResponse.json({ apiKey: setting.value });
}
