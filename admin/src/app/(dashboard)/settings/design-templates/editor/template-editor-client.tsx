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
      if (existingTemplate) {
        const res = await fetch(`/api/design/templates/${existingTemplate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, format, category: category || null, canvasJson, thumbnail }),
        });
        if (!res.ok) throw new Error();
        toast.success("Vorlage aktualisiert");
      } else {
        const res = await fetch("/api/design/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, format, category: category || null, canvasJson, thumbnail }),
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
    "h-7 rounded-md border border-white/[0.08] bg-[#1a1b1e] px-2.5 text-[12px] text-zinc-200 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors";

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
            <div className="flex items-center gap-2">
              <Link
                href="/settings/design-templates"
                className="flex items-center gap-1 text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors mr-1"
              >
                <IconArrowLeft className="size-3.5" />
              </Link>
              <div className="w-px h-5 bg-white/10" />
              <input
                className={fieldClass + " w-44"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vorlagen-Name *"
              />
              <select
                className={fieldClass + " w-20"}
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="2x6">2x6</option>
                <option value="4x6">4x6</option>
              </select>
              <input
                className={fieldClass + " w-28"}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Kategorie"
              />
              {saving && <span className="text-[11px] text-white/40">Speichert...</span>}
            </div>
          }
        />
      </div>
    </div>
  );
}
