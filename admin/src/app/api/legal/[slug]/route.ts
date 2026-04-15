import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public read-only endpoint for legal pages.
// GET /api/legal/impressum -> { html: string }
// GET /api/legal/datenschutz -> { html: string }
// No auth, but only these two slugs are permitted.

const SLUG_TO_KEY: Record<string, string> = {
  impressum: "legal_impressum_html",
  datenschutz: "legal_datenschutz_html",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const key = SLUG_TO_KEY[slug];

  if (!key) {
    return NextResponse.json({ error: "Unbekannte Seite" }, { status: 404 });
  }

  try {
    const setting = await prisma.appSetting.findUnique({ where: { key } });
    return NextResponse.json(
      { html: setting?.value ?? "" },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      }
    );
  } catch {
    return NextResponse.json({ html: "" });
  }
}
