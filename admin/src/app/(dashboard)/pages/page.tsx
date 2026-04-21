import Link from "next/link";
import { prisma } from "@/lib/db";
import { syncPagesFromDefinitions } from "@/lib/pages";
import { PAGE_DEFINITIONS } from "@/lib/page-definitions";
import { IconLayoutGrid, IconChevronRight } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  special: "Spezial",
  city: "Städte",
  product: "Produkte & Services",
  other: "Sonstige",
};
const CATEGORY_ORDER = ["special", "city", "product", "other"];

export default async function PagesIndexPage() {
  await syncPagesFromDefinitions();

  const rows = await prisma.page.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: { _count: { select: { imageSlots: true, impressionPhotos: true } } },
  });

  const pages = rows.map((p) => {
    const def = PAGE_DEFINITIONS.find((d) => d.slug === p.slug);
    return {
      slug: p.slug,
      title: p.title,
      category: p.category,
      slotCount: def?.slots.length ?? 0,
      filledSlotCount: p._count.imageSlots,
      impressionCount: p._count.impressionPhotos,
      hasImpressionSection: def?.hasImpressionSection ?? false,
    };
  });

  const grouped: Record<string, typeof pages> = {};
  for (const p of pages) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconLayoutGrid className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Seiten</h1>
          <p className="text-sm text-muted-foreground">
            Bilder und Impressionen-Sektion pro Landing-Page pflegen. Wenn kein Bild
            gepflegt ist, greift der Fallback aus dem Code.
          </p>
        </div>
      </div>

      {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => (
        <div key={cat} className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
            {CATEGORY_LABELS[cat] ?? cat}
          </h2>
          <div className="grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {grouped[cat].map((page) => (
              <Link
                key={page.slug}
                href={`/pages/${page.slug}`}
                className="group rounded-xl border border-white/[0.10] bg-card p-4 hover:border-[#F6A11C]/40 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-zinc-100 truncate">
                    {page.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <code className="text-[11px] text-zinc-500">/{page.slug}</code>
                    {page.slotCount > 0 && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-400">
                        {page.filledSlotCount}/{page.slotCount} Bilder
                      </span>
                    )}
                    {page.hasImpressionSection && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-400">
                        {page.impressionCount} Impressionen
                      </span>
                    )}
                  </div>
                </div>
                <IconChevronRight className="size-4 text-zinc-500 group-hover:text-[#F6A11C] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
