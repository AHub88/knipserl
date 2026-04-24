"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { toast } from "sonner";
import { LayoutEditorLoader } from "@/components/design-editor/layout-editor-loader";
import { useSidebar } from "@/components/ui/sidebar";
import { DESIGN_TEMPLATE_CATEGORIES } from "@/lib/design-template-categories";

type ExistingTemplate = {
  id: string;
  name: string;
  format: string;
  category: string | null;
  categories?: string[];
  canvasJson: unknown;
} | null;

export function TemplateEditorClient({
  existingTemplate,
}: {
  existingTemplate: ExistingTemplate;
}) {
  const router = useRouter();
  const { setOpen } = useSidebar();
  const [name, setName] = useState(existingTemplate?.name ?? "");
  const [format, setFormat] = useState(existingTemplate?.format ?? "2x6");
  const [categories, setCategories] = useState<string[]>(() => {
    // Bevorzugt das neue `categories`-Array; fallback auf legacy-`category`.
    if (existingTemplate?.categories && existingTemplate.categories.length > 0) {
      return existingTemplate.categories;
    }
    if (existingTemplate?.category) return [existingTemplate.category];
    return [];
  });
  const [saving, setSaving] = useState(false);

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  // Sidebar beim Laden des Editors einklappen
  useEffect(() => {
    setOpen(false);
    return () => setOpen(true);
  }, [setOpen]);

  async function handleSaveTemplate(canvasJson: unknown, thumbnailDataUrl: string | null) {
    if (!name.trim()) {
      toast.error("Bitte einen Namen eingeben");
      return;
    }

    // Upload thumbnail if available
    let thumbnail: string | null = null;
    if (thumbnailDataUrl) {
      try {
        const resp = await fetch(thumbnailDataUrl);
        const blob = await resp.blob();
        const form = new FormData();
        form.append("file", blob, "thumbnail.png");
        const upRes = await fetch("/api/uploads/design", { method: "POST", body: form });
        if (upRes.ok) {
          const upData = await upRes.json();
          thumbnail = upData.url;
        }
      } catch { /* thumbnail upload failed, continue without */ }
    }

    setSaving(true);
    try {
      const payload = { name, format, categories, canvasJson, thumbnail };
      if (existingTemplate) {
        const res = await fetch(`/api/design/templates/${existingTemplate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Vorlage aktualisiert");
      } else {
        const res = await fetch("/api/design/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Vorlage erstellt");
      }
      router.push("/settings/design-templates");
      router.refresh();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "h-12 rounded-xl border border-border bg-muted px-4 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors";

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Editor */}
      <div className="flex-1 min-h-0">
        <LayoutEditorLoader
          key={format}
          orderId=""
          token="admin-template"
          format={format}
          orderInfo={{
            customerName: "Admin",
            eventType: "Vorlage",
            eventDate: "",
            locationName: "",
          }}
          existingDesign={existingTemplate ? { canvasJson: existingTemplate.canvasJson } : null}
          mode="admin"
          onSaveTemplate={handleSaveTemplate}
          templateMeta={
            <div className="flex items-center gap-4">
              <Link
                href="/settings/design-templates"
                className="flex items-center gap-2 h-12 px-5 rounded-xl border border-border bg-foreground/[0.03] text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.10] transition-colors"
              >
                <IconArrowLeft className="size-4" />
                <span>Zurück</span>
              </Link>
              <div className="w-px h-10 bg-border" />
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[11px] text-muted-foreground/70 mb-1 leading-none">Name</label>
                  <input
                    className={fieldClass + " w-52"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="z.B. Hochzeit Elegant"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground/70 mb-1 leading-none">Format</label>
                  <select
                    className={fieldClass + " w-36"}
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option value="2x6">5×15 cm</option>
                    <option value="4x6">10×15 cm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground/70 mb-1 leading-none">
                    Kategorien {categories.length > 0 && <span className="text-foreground/40">({categories.length})</span>}
                  </label>
                  <div className="flex items-center gap-1.5 h-12 flex-wrap">
                    {DESIGN_TEMPLATE_CATEGORIES.map((cat) => {
                      const active = categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={
                            "h-8 px-3 rounded-lg text-xs font-medium transition-colors border " +
                            (active
                              ? "bg-primary text-black border-primary"
                              : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-foreground/30")
                          }
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              {saving && <span className="text-sm text-foreground/40">Speichert...</span>}
            </div>
          }
        />
      </div>
    </div>
  );
}
