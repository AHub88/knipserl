import { prisma } from "@/lib/db";
import { PAGE_DEFINITIONS, type PageDefinition } from "@/lib/page-definitions";

/**
 * Gleicht die DB-Tabelle `pages` mit der Code-Konstante `PAGE_DEFINITIONS` ab.
 * Fehlende Pages werden angelegt, bestehende aktualisiert (Title/Category/Order).
 * Pages, die in der DB aber nicht mehr in der Konstante stehen, bleiben unangetastet
 * (damit niemand versehentlich eine Seite wegkonfiguriert und Bild-Zuordnungen verliert).
 */
export async function syncPagesFromDefinitions() {
  for (const def of PAGE_DEFINITIONS) {
    await prisma.page.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug,
        title: def.title,
        category: def.category,
        sortOrder: def.sortOrder,
      },
      update: {
        title: def.title,
        category: def.category,
        sortOrder: def.sortOrder,
      },
    });
  }
}

export type PageWithDefinition = {
  id: string;
  slug: string;
  title: string;
  category: string;
  sortOrder: number;
  definition: PageDefinition;
};
