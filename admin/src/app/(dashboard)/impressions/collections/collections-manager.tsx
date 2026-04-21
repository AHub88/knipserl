"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconPlus, IconCheck, IconX, IconTrash, IconEdit } from "@tabler/icons-react";
import { toast } from "sonner";

type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  photoCount: number;
};

const inputClass =
  "h-9 w-full rounded-lg border border-white/[0.08] bg-[#1c1d20] px-3 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors";

export function CollectionsManager({ initialCollections }: { initialCollections: Collection[] }) {
  const router = useRouter();
  const [collections, setCollections] = useState(initialCollections);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name.trim()) {
      toast.error("Name ist Pflicht");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/impressions/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), description: description.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Fehler beim Anlegen");
      }
      const created = (await res.json()) as Collection;
      setCollections((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "de")));
      setName("");
      setSlug("");
      setDescription("");
      setShowAdd(false);
      toast.success("Collection angelegt");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string, name: string, photoCount: number) {
    const msg = photoCount > 0
      ? `Collection "${name}" wirklich löschen? ${photoCount} Bild-Zuordnung${photoCount === 1 ? "" : "en"} gehen verloren (Bilder selbst bleiben erhalten).`
      : `Collection "${name}" wirklich löschen?`;
    if (!confirm(msg)) return;
    try {
      const res = await fetch(`/api/impressions/collections/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCollections((prev) => prev.filter((c) => c.slug !== slug));
      toast.success("Collection gelöscht");
      router.refresh();
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">{collections.length} Collections</span>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 transition-colors"
        >
          <IconPlus className="size-4" />
          Neue Collection
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-[#F6A11C]/30 bg-card p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">Neue Collection anlegen</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Rosenheim"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Slug (optional, wird aus Name erzeugt)
              </label>
              <input
                className={inputClass}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="z.B. rosenheim"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Beschreibung (intern, optional)</label>
            <input
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurz, wofür diese Collection verwendet wird"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 disabled:opacity-50 transition-colors"
            >
              <IconCheck className="size-3.5" />
              {saving ? "Speichern..." : "Anlegen"}
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setName("");
                setSlug("");
                setDescription("");
              }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/[0.08] text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <IconX className="size-3.5" />
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {collections.length === 0 ? (
        <div className="rounded-xl border border-white/[0.10] bg-card p-8 text-center">
          <p className="text-sm text-zinc-400">Noch keine Collections angelegt.</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-white/[0.10] bg-card p-4 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-zinc-100 truncate">{c.name}</h3>
                  <code className="text-[11px] text-zinc-500">/{c.slug}</code>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-400 flex-shrink-0">
                  {c.photoCount} Bild{c.photoCount === 1 ? "" : "er"}
                </span>
              </div>
              {c.description && (
                <p className="text-xs text-zinc-500 line-clamp-2">{c.description}</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/impressions/collections/${c.slug}`}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white/[0.06] text-zinc-300 hover:bg-white/[0.10] transition-colors"
                >
                  <IconEdit className="size-3" />
                  Bearbeiten
                </Link>
                <button
                  onClick={() => handleDelete(c.slug, c.name, c.photoCount)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-400/[0.06] transition-colors ml-auto"
                >
                  <IconTrash className="size-3" />
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
