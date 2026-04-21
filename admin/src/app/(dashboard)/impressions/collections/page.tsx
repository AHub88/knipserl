import { prisma } from "@/lib/db";
import { IconFolders, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { CollectionsManager } from "./collections-manager";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const rows = await prisma.impressionCollection.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { photos: true } } },
  });

  const collections = rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    photoCount: c._count.photos,
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/impressions"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <IconArrowLeft className="size-4" />
        Alle Impressionen
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconFolders className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Collections</h1>
          <p className="text-sm text-muted-foreground">
            Kuratierte Bildergruppen f&uuml;r einzelne Landing-Pages. Slug steuert, wo die Collection angezeigt wird (z.B. <code className="px-1 rounded bg-white/5">rosenheim</code> f&uuml;r <code className="px-1 rounded bg-white/5">/fotobox-rosenheim</code>).
          </p>
        </div>
      </div>

      <CollectionsManager initialCollections={JSON.parse(JSON.stringify(collections))} />
    </div>
  );
}
