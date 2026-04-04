import { prisma } from "@/lib/db";
import { IconListDetails } from "@tabler/icons-react";
import { StandardItemsManager } from "./standard-items-manager";

export default async function StandardItemsPage() {
  const items = await prisma.standardLineItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconListDetails className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Standard-Positionen
          </h1>
          <p className="text-sm text-muted-foreground">
            Vordefinierte Positionen f&uuml;r Angebote, Rechnungen und Auftragsbest&auml;tigungen
          </p>
        </div>
      </div>

      <StandardItemsManager initialItems={items} />
    </div>
  );
}
