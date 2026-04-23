"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconPlus,
  IconCheck,
  IconX,
  IconTrash,
  IconToggleLeft,
  IconToggleRight,
  IconEdit,
  IconCopy,
} from "@tabler/icons-react";
import { toast } from "sonner";

type Template = {
  id: string;
  name: string;
  format: string;
  thumbnail: string | null;
  category: string | null;
  active: boolean;
  sortOrder: number;
};

const inputClass =
  "h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors";

export function DesignTemplatesManager({
  initialTemplates,
}: {
  initialTemplates: Template[];
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    format: "2x6",
    category: "",
  });
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeItems = templates.filter((t) => t.active);
  const inactiveItems = templates.filter((t) => !t.active);
  const displayItems = showInactive ? templates : activeItems;

  async function handleAdd() {
    if (!addForm.name) {
      toast.error("Name ist ein Pflichtfeld");
      return;
    }

    const file = fileInputRef.current?.files?.[0];

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", addForm.name);
      formData.append("format", addForm.format);
      if (addForm.category) formData.append("category", addForm.category);
      if (file) formData.append("file", file);

      const res = await fetch("/api/design/templates", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTemplates((prev) => [...prev, created]);
      setAddForm({ name: "", format: "2x6", category: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowAdd(false);
      toast.success("Vorlage erstellt");
      router.refresh();
    } catch {
      toast.error("Fehler beim Erstellen");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Vorlage wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/design/templates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Vorlage gelöscht");
      router.refresh();
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const res = await fetch(`/api/design/templates/${id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const copy = await res.json();
      setTemplates((prev) => [...prev, copy]);
      toast.success("Vorlage dupliziert");
      router.refresh();
    } catch {
      toast.error("Fehler beim Duplizieren");
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/design/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!res.ok) throw new Error();
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, active: !currentActive } : t))
      );
      toast.success(currentActive ? "Vorlage deaktiviert" : "Vorlage aktiviert");
      router.refresh();
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft className="size-4" />
          Einstellungen
        </Link>
        <div className="flex items-center gap-2">
          {inactiveItems.length > 0 && (
            <button
              onClick={() => setShowInactive((v) => !v)}
              className="h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showInactive
                ? "Inaktive ausblenden"
                : `${inactiveItems.length} inaktive`}
            </button>
          )}
          <Link
            href="/settings/design-templates/editor"
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <IconPlus className="size-4" />
            Neue Vorlage erstellen
          </Link>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconPlus className="size-4" />
            Schnell-Upload
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-primary/30 bg-card p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Neue Vorlage erstellen
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Name *</label>
              <input
                className={inputClass}
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="z.B. Hochzeit Elegant"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Format</label>
              <select
                className={inputClass}
                value={addForm.format}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, format: e.target.value }))
                }
              >
                <option value="2x6">5×15 cm</option>
                <option value="4x6">10×15 cm</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Kategorie</label>
              <input
                className={inputClass}
                value={addForm.category}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="z.B. Hochzeit, Geburtstag"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Hintergrund-Bild (PNG)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="h-9 w-full text-sm text-muted-foreground file:mr-3 file:h-9 file:rounded-lg file:border-0 file:bg-foreground/[0.06] file:px-3 file:text-sm file:text-foreground/80 hover:file:bg-foreground/[0.10] transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <IconCheck className="size-3.5" />
              Erstellen
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconX className="size-3.5" />
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {displayItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Noch keine Design-Vorlagen vorhanden.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayItems.map((template) => (
            <div
              key={template.id}
              className={`group rounded-xl border bg-card overflow-hidden ${
                !template.active
                  ? "border-border/50 opacity-50"
                  : "border-border"
              }`}
            >
              <div className="relative">
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-48 object-contain bg-foreground/[0.03]"
                  />
                ) : (
                  <div className="w-full h-48 bg-foreground/[0.03] flex items-center justify-center">
                    <span className="text-xs text-muted-foreground/70">Kein Bild</span>
                  </div>
                )}
                {/* Overlay: mobil immer sichtbar, desktop nur bei hover */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 backdrop-blur-sm transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                  <Link
                    href={`/settings/design-templates/editor?id=${template.id}`}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-foreground/[0.10] transition-colors"
                  >
                    <IconEdit className="size-5" />
                    <span className="text-[10px] font-medium">Bearbeiten</span>
                  </Link>
                  <button
                    onClick={() => handleDuplicate(template.id)}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-foreground/[0.10] transition-colors"
                  >
                    <IconCopy className="size-5" />
                    <span className="text-[10px] font-medium">Duplizieren</span>
                  </button>
                  <button
                    onClick={() =>
                      handleToggleActive(template.id, template.active)
                    }
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-foreground/[0.10] transition-colors"
                  >
                    {template.active ? (
                      <IconToggleRight className="size-5 text-green-400" />
                    ) : (
                      <IconToggleLeft className="size-5" />
                    )}
                    <span className="text-[10px] font-medium">
                      {template.active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-foreground/80 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <IconTrash className="size-5" />
                    <span className="text-[10px] font-medium">Löschen</span>
                  </button>
                </div>
              </div>
              <div className="p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate flex-1">
                    {template.name}
                  </h3>
                  <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-foreground/[0.06] text-muted-foreground">
                    {template.format === "4x6" ? "10×15 cm" : "5×15 cm"}
                  </span>
                </div>
                {template.category && (
                  <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-foreground/[0.06] text-muted-foreground">
                    {template.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
