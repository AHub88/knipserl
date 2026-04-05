"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { toast } from "sonner";
import { LayoutEditorLoader } from "@/components/design-editor/layout-editor-loader";

type ExistingTemplate = {
  id: string;
  name: string;
  format: string;
  category: string | null;
  canvasJson: unknown;
} | null;

export function TemplateEditorClient({
  existingTemplate,
}: {
  existingTemplate: ExistingTemplate;
}) {
  const router = useRouter();
  const [name, setName] = useState(existingTemplate?.name ?? "");
  const [format, setFormat] = useState(existingTemplate?.format ?? "2x6");
  const [category, setCategory] = useState(existingTemplate?.category ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSaveTemplate(canvasJson: unknown) {
    if (!name.trim()) {
      toast.error("Bitte einen Namen eingeben");
      return;
    }

    setSaving(true);
    try {
      if (existingTemplate) {
        // Update existing
        const res = await fetch(`/api/design/templates/${existingTemplate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, format, category: category || null, canvasJson }),
        });
        if (!res.ok) throw new Error();
        toast.success("Vorlage aktualisiert");
      } else {
        // Create new
        const res = await fetch("/api/design/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, format, category: category || null, canvasJson }),
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

  const inputClass =
    "h-9 w-full rounded-lg border border-white/[0.08] bg-[#1c1d20] px-3 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors";

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 bg-[#222326] px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/settings/design-templates"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <IconArrowLeft className="size-4" />
            Zurück
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div>
              <label className="block text-[10px] text-zinc-500 mb-0.5">Name *</label>
              <input
                className={inputClass + " w-56"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Hochzeit Elegant"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-0.5">Format</label>
              <select
                className={inputClass + " w-24"}
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="2x6">2x6</option>
                <option value="4x6">4x6</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-0.5">Kategorie</label>
              <input
                className={inputClass + " w-40"}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="z.B. Hochzeit"
              />
            </div>
          </div>
          {saving && <span className="text-xs text-white/40">Wird gespeichert...</span>}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <LayoutEditorLoader
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
        />
      </div>
    </div>
  );
}
