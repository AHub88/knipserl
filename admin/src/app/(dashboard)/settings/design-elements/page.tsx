import { prisma } from "@/lib/db";
import { IconPalette } from "@tabler/icons-react";
import { DesignElementsManager } from "./design-elements-manager";

export default async function DesignElementsPage() {
  const elements = await prisma.designElement.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconPalette className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Design-Elemente
          </h1>
          <p className="text-sm text-muted-foreground">
            Logos, Rahmen, Deko und Sticker f&uuml;r den Layout-Editor
          </p>
        </div>
      </div>

      <DesignElementsManager initialElements={JSON.parse(JSON.stringify(elements))} />
    </div>
  );
}
