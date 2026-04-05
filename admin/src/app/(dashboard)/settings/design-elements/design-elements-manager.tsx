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
} from "@tabler/icons-react";
import { toast } from "sonner";

type DesignElement = {
  id: string;
  name: string;
  imageUrl: string;
  category: string | null;
  sortOrder: number;
  active: boolean;
};

const inputClass =
  "h-9 w-full rounded-lg border border-white/[0.08] bg-[#1c1d20] px-3 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors";

const CATEGORY_SUGGESTIONS = ["Rahmen", "Deko", "Logos", "Sticker", "Texte"];

export function DesignElementsManager({
  initialElements,
}: {
  initialElements: DesignElement[];
}) {
  const router = useRouter();
  const [elements, setElements] = useState(initialElements);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", category: "" });
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeItems = elements.filter((e) => e.active);
  const inactiveItems = elements.filter((e) => !e.active);
  const baseItems = showInactive ? elements : activeItems;
  const displayItems = filterCategory
    ? baseItems.filter((e) => e.category === filterCategory)
    : baseItems;

  const categories = Array.from(
    new Set(elements.map((e) => e.category).filter(Boolean))
  ) as string[];

  async function handleAdd() {
    if (!addForm.name) {
      toast.error("Name ist ein Pflichtfeld");
      return;
    }
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Bitte eine Datei auswählen");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", addForm.name);
      if (addForm.category) formData.append("category", addForm.category);
      formData.append("file", file);

      const res = await fetch("/api/design/elements", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setElements((prev) => [...prev, created]);
      setAddForm({ name: "", category: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowAdd(false);
      toast.success("Element erstellt");
      router.refresh();
    } catch {
      toast.error("Fehler beim Erstellen");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Element wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/design/elements/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setElements((prev) => prev.filter((e) => e.id !== id));
      toast.success("Element gelöscht");
      router.refresh();
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/design/elements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!res.ok) throw new Error();
      setElements((prev) =>
        prev.map((e) => (e.id === id ? { ...e, active: !currentActive } : e))
      );
      toast.success(currentActive ? "Element deaktiviert" : "Element aktiviert");
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
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <IconArrowLeft className="size-4" />
          Einstellungen
        </Link>
        <div className="flex items-center gap-2">
          {inactiveItems.length > 0 && (
            <button
              onClick={() => setShowInactive((v) => !v)}
              className="h-9 px-3 rounded-lg border border-white/[0.08] text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {showInactive
                ? "Inaktive ausblenden"
                : `${inactiveItems.length} inaktive`}
            </button>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 transition-colors"
          >
            <IconPlus className="size-4" />
            Neues Element
          </button>
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory(null)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterCategory === null
                ? "bg-[#F6A11C] text-black"
                : "bg-white/[0.06] text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-[#F6A11C] text-black"
                  : "bg-white/[0.06] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="rounded-xl border border-[#F6A11C]/30 bg-card p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">
            Neues Element hochladen
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input
                className={inputClass}
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="z.B. Goldener Rahmen"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Kategorie</label>
              <input
                className={inputClass}
                value={addForm.category}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="z.B. Rahmen, Deko, Logos"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Bild (PNG/SVG) *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                className="h-9 w-full text-sm text-zinc-400 file:mr-3 file:h-9 file:rounded-lg file:border-0 file:bg-white/[0.06] file:px-3 file:text-sm file:text-zinc-300 hover:file:bg-white/[0.10] transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 disabled:opacity-50 transition-colors"
            >
              <IconCheck className="size-3.5" />
              Erstellen
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/[0.08] text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <IconX className="size-3.5" />
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {displayItems.length === 0 ? (
        <div className="rounded-xl border border-white/[0.10] bg-card p-8 text-center">
          <p className="text-sm text-zinc-400">
            {filterCategory
              ? `Keine Elemente in Kategorie "${filterCategory}".`
              : "Noch keine Design-Elemente vorhanden."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {displayItems.map((element) => (
            <div
              key={element.id}
              className={`rounded-xl border bg-card overflow-hidden ${
                !element.active
                  ? "border-white/[0.05] opacity-50"
                  : "border-white/[0.10]"
              }`}
            >
              <div className="aspect-square bg-white/[0.03] flex items-center justify-center p-3">
                <img
                  src={element.imageUrl}
                  alt={element.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="p-2.5 space-y-1">
                <h3 className="text-xs font-semibold text-zinc-200 truncate">
                  {element.name}
                </h3>
                {element.category && (
                  <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-400">
                    {element.category}
                  </span>
                )}
                <div className="flex items-center gap-1 pt-0.5">
                  <button
                    onClick={() =>
                      handleToggleActive(element.id, element.active)
                    }
                    className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                    title={element.active ? "Deaktivieren" : "Aktivieren"}
                  >
                    {element.active ? (
                      <IconToggleRight className="size-3.5 text-green-400" />
                    ) : (
                      <IconToggleLeft className="size-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(element.id)}
                    className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/[0.06] transition-colors"
                    title="Löschen"
                  >
                    <IconTrash className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
