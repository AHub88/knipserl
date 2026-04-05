import { NextResponse } from "next/server";
import { DESIGN_FONTS, FONT_CATEGORIES } from "@/lib/design-fonts";

export async function GET() {
  return NextResponse.json({
    fonts: DESIGN_FONTS,
    categories: FONT_CATEGORIES,
  });
}
