// Zentrale Definition aller Landing-Pages der Webseite.
//
// Jede Page hat einen Slug (= URL-Pfad), einen Titel für das Admin, eine Kategorie
// und eine Liste von Bild-Slots. Slots definieren, an welchen Stellen in der Seite
// ein Bild austauschbar ist. Wenn im Admin nichts gepflegt wird, greift der
// Fallback im Webseiten-Code.
//
// Neue Page hinzufügen: Eintrag unten ergänzen. Beim nächsten Öffnen der
// /pages-Übersicht im Admin wird die Page automatisch in der DB angelegt.

export type PageCategory = "city" | "product" | "special";

export type SlotDefinition = {
  key: string;           // z.B. "hero", "teaser"
  label: string;         // Anzeigename im Admin
  description?: string;  // optionale Info für den Redakteur
  aspectRatio?: string;  // z.B. "16/9", "4/3" — für Vorschau-Grösse
};

export type PageDefinition = {
  slug: string;
  title: string;
  category: PageCategory;
  sortOrder: number;
  hasImpressionSection: boolean; // ob unten die kuratierte Bilderliste verfügbar sein soll
  slots: SlotDefinition[];
};

export const PAGE_DEFINITIONS: PageDefinition[] = [
  // ── Spezial ────────────────────────────────────────────────
  {
    slug: "impressionen",
    title: "Impressionen (Hauptseite)",
    category: "special",
    sortOrder: 0,
    hasImpressionSection: true,
    slots: [],
  },

  // ── Städte ──────────────────────────────────────────────────
  {
    slug: "fotobox-rosenheim",
    title: "Fotobox Rosenheim",
    category: "city",
    sortOrder: 10,
    hasImpressionSection: false,
    slots: [
      { key: "hero", label: "Hero-Bild", aspectRatio: "16/9" },
    ],
  },
  {
    slug: "fotobox-fuer-muenchen",
    title: "Fotobox München",
    category: "city",
    sortOrder: 11,
    hasImpressionSection: false,
    slots: [
      { key: "hero", label: "Hero-Bild", aspectRatio: "16/9" },
    ],
  },
  {
    slug: "fotobox-ebersberg",
    title: "Fotobox Ebersberg",
    category: "city",
    sortOrder: 12,
    hasImpressionSection: false,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
  {
    slug: "fotobox-miesbach",
    title: "Fotobox Miesbach",
    category: "city",
    sortOrder: 13,
    hasImpressionSection: false,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
  {
    slug: "fotobox-traunstein",
    title: "Fotobox Traunstein",
    category: "city",
    sortOrder: 14,
    hasImpressionSection: false,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
  {
    slug: "fotobox-wasserburg",
    title: "Fotobox Wasserburg am Inn",
    category: "city",
    sortOrder: 15,
    hasImpressionSection: false,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
  {
    slug: "fotobox-muehldorf",
    title: "Fotobox Mühldorf am Inn",
    category: "city",
    sortOrder: 16,
    hasImpressionSection: false,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
  {
    slug: "fotobox-erding",
    title: "Fotobox Erding",
    category: "city",
    sortOrder: 17,
    hasImpressionSection: false,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
  {
    slug: "fotobox-kufstein",
    title: "Fotobox Kufstein",
    category: "city",
    sortOrder: 18,
    hasImpressionSection: false,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },

  // ── Produkt-Pages ───────────────────────────────────────────
  {
    slug: "fotobox-fuer-hochzeit",
    title: "Fotobox für Hochzeit",
    category: "product",
    sortOrder: 20,
    hasImpressionSection: true,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
  {
    slug: "fotobox-fuer-firmenfeier",
    title: "Fotobox für Firmenfeier",
    category: "product",
    sortOrder: 21,
    hasImpressionSection: true,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
  {
    slug: "fotobox-fuer-messe",
    title: "Fotobox für Messe",
    category: "product",
    sortOrder: 22,
    hasImpressionSection: true,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
  {
    slug: "fotobox-fuer-weihnachtsfeier",
    title: "Fotobox für Weihnachtsfeier",
    category: "product",
    sortOrder: 23,
    hasImpressionSection: true,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
  {
    slug: "love-buchstaben",
    title: "LOVE-Buchstaben",
    category: "product",
    sortOrder: 30,
    hasImpressionSection: true,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
  {
    slug: "audio-gaestebuch",
    title: "Audio-Gästebuch",
    category: "product",
    sortOrder: 31,
    hasImpressionSection: true,
    slots: [{ key: "hero", label: "Hero-Bild", aspectRatio: "16/9" }],
  },
];

export function findPageDefinition(slug: string): PageDefinition | undefined {
  return PAGE_DEFINITIONS.find((p) => p.slug === slug);
}
