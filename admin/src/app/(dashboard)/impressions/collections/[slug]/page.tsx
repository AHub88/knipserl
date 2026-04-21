import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { IconFolder, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { buildUrls } from "@/lib/impression-images";
import { CollectionEditor } from "./collection-editor";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [collection, allPhotos] = await Promise.all([
    prisma.impressionCollection.findUnique({
      where: { slug },
      include: {
        photos: {
          orderBy: { sortOrder: "asc" },
          select: { photoId: true, sortOrder: true },
        },
      },
    }),
    prisma.impressionPhoto.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  if (!collection) notFound();

  const photosWithUrls = allPhotos.map((p) => {
    const isAnimated = p.originalFilename.endsWith(".gif");
    return {
      id: p.id,
      alt: p.alt,
      active: p.active,
      thumbUrl: buildUrls(p.originalFilename, p.width, isAnimated).original,
    };
  });

  const selectedIds = collection.photos.map((cp) => cp.photoId);

  return (
    <div className="space-y-6">
      <Link
        href="/impressions/collections"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <IconArrowLeft className="size-4" />
        Alle Collections
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconFolder className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{collection.name}</h1>
          <code className="text-sm text-muted-foreground">/{collection.slug}</code>
        </div>
      </div>

      <CollectionEditor
        slug={collection.slug}
        allPhotos={photosWithUrls}
        initialSelectedIds={selectedIds}
      />
    </div>
  );
}
