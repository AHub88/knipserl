import { prisma } from "@/lib/db";
import { IconTemplate } from "@tabler/icons-react";
import { DesignTemplatesManager } from "./design-templates-manager";

export default async function DesignTemplatesPage() {
  const templates = await prisma.layoutTemplate.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
          <IconTemplate className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Design-Vorlagen
          </h1>
          <p className="text-sm text-muted-foreground">
            Hintergrund-Vorlagen f&uuml;r den Layout-Editor verwalten
          </p>
        </div>
      </div>

      <DesignTemplatesManager initialTemplates={JSON.parse(JSON.stringify(templates))} />
    </div>
  );
}
