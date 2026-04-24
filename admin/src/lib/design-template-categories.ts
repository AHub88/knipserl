// Zentrale Liste der Template-Kategorien.
// Wird vom Admin-Template-Editor (Multi-Select) und vom Customer-Vorlagen-Panel
// (Filter-Chips) gelesen. Labels sind die UI-Anzeige; die gespeicherten Werte in
// der DB (layout_templates.categories) sind genau diese Strings.
export const DESIGN_TEMPLATE_CATEGORIES = [
  "Geburtstag",
  "Hochzeit",
  "Weihnachtsfeier",
  "Sommerfest",
  "Firmenevent",
] as const;

export type DesignTemplateCategory = (typeof DESIGN_TEMPLATE_CATEGORIES)[number];
