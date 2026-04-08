import { prisma } from "@/lib/db";
import { IconPhoto } from "@tabler/icons-react";
import { LogosManager } from "./logos-manager";

export default async function LogosPage() {
  const logos = await prisma.$queryRaw<
    { id: string; name: string; filename: string; createdAt: Date }[]
  >`SELECT * FROM client_logos ORDER BY LOWER(name) ASC`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconPhoto className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Referenz-Logos
          </h1>
          <p className="text-sm text-muted-foreground">
            Kundenlogos f&uuml;r die Webseite verwalten (Sortierung immer A-Z)
          </p>
        </div>
      </div>

      <LogosManager initialLogos={JSON.parse(JSON.stringify(logos))} />
    </div>
  );
}
