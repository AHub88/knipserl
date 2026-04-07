import { NextResponse } from "next/server";
import { DESIGN_FONTS, FONT_CATEGORIES } from "@/lib/design-fonts";
import { prisma } from "@/lib/db";

export async function GET() {
  const customFonts = await prisma.customFont.findMany({
    where: { active: true },
    orderBy: { family: "asc" },
  });

  // Group custom fonts by family (multiple weights/styles per family)
  const customFamilies = new Map<string, { family: string; category: string; weights: number[]; fileUrls: { url: string; weight: number; style: string }[] }>();
  for (const cf of customFonts) {
    const existing = customFamilies.get(cf.family);
    if (existing) {
      if (!existing.weights.includes(cf.weight)) existing.weights.push(cf.weight);
      existing.fileUrls.push({ url: cf.fileUrl, weight: cf.weight, style: cf.style });
    } else {
      customFamilies.set(cf.family, {
        family: cf.family,
        category: "custom",
        weights: [cf.weight],
        fileUrls: [{ url: cf.fileUrl, weight: cf.weight, style: cf.style }],
      });
    }
  }

  return NextResponse.json({
    fonts: DESIGN_FONTS,
    categories: [
      { key: "custom", label: "Eigene Schriften" },
      ...FONT_CATEGORIES,
    ],
    customFonts: Array.from(customFamilies.values()),
  });
}
