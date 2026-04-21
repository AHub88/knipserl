import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { findPageDefinition } from "@/lib/page-definitions";
import { syncPagesFromDefinitions } from "@/lib/pages";
import { buildUrls } from "@/lib/impression-images";
import { IconArrowLeft, IconLayoutGrid } from "@tabler/icons-react";
import { PageEditor } from "./page-editor";

export const dynamic = "force-dynamic";

export default async function PageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = findPageDefinition(slug);
  if (!def) notFound();

  await syncPagesFromDefinitions();

  const [page, allAssets] = await Promise.all([
    prisma.page.findUnique({
      where: { slug },
      include: {
        imageSlots: { include: { mediaAsset: true } },
        impressionPhotos: {
          orderBy: { sortOrder: "asc" },
          include: { mediaAsset: true },
        },
      },
    }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  if (!page) notFound();

  const assetsForPicker = allAssets.map((a) => {
    const isAnimated = a.originalFilename.endsWith(".gif");
    return {
      id: a.id,
      alt: a.alt,
      active: a.active,
      originalFilename: a.originalFilename,
      thumbUrl: buildUrls(a.originalFilename, a.width, isAnimated).original,
    };
  });

  const slots = def.slots.map((slotDef) => {
    const existing = page.imageSlots.find((s) => s.slotKey === slotDef.key);
    const asset = existing?.mediaAsset ?? null;
    return {
      key: slotDef.key,
      label: slotDef.label,
      description: slotDef.description ?? null,
      aspectRatio: slotDef.aspectRatio ?? null,
      altOverride: existing?.altOverride ?? "",
      assetId: asset?.id ?? null,
      assetThumb: asset ? buildUrls(asset.originalFilename, asset.width, asset.originalFilename.endsWith(".gif")).original : null,
      assetAlt: asset?.alt ?? "",
    };
  });

  const impressionIds = page.impressionPhotos
    .filter((ip) => ip.mediaAsset.active)
    .map((ip) => ip.mediaAssetId);

  return (
    <div className="space-y-6">
      <Link
        href="/pages"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <IconArrowLeft className="size-4" />
        Alle Seiten
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconLayoutGrid className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{page.title}</h1>
          <code className="text-sm text-muted-foreground">/{page.slug}</code>
        </div>
      </div>

      <PageEditor
        pageSlug={page.slug}
        slots={slots}
        hasImpressionSection={def.hasImpressionSection}
        initialImpressionIds={impressionIds}
        allAssets={assetsForPicker}
      />
    </div>
  );
}
