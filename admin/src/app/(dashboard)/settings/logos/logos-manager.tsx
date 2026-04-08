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
} from "@tabler/icons-react";
import { toast } from "sonner";

type ClientLogo = {
  id: string;
  name: string;
  filename: string;
  createdAt: string;
};

const inputClass =
  "h-9 w-full rounded-lg border border-white/[0.08] bg-[#1c1d20] px-3 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors";

export function LogosManager({
  initialLogos,
}: {
  initialLogos: ClientLogo[];
}) {
  const router = useRouter();
  const [logos, setLogos] = useState(initialLogos);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAdd() {
    if (!addName.trim()) {
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
      formData.append("name", addName.trim());
      formData.append("file", file);

      const res = await fetch("/api/client-logos", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Fehler beim Erstellen");
      }
      const created = await res.json();
      setLogos((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }))
      );
      setAddName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowAdd(false);
      toast.success("Logo hinzugefügt");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Erstellen");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Logo "${name}" wirklich löschen?`)) return;
    try {
      const res = await fetch(`/api/client-logos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setLogos((prev) => prev.filter((l) => l.id !== id));
      toast.success("Logo gelöscht");
      router.refresh();
    } catch {
      toast.error("Fehler beim Löschen");
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
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{logos.length} Logos</span>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 transition-colors"
          >
            <IconPlus className="size-4" />
            Logo hinzufügen
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-[#F6A11C]/30 bg-card p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">
            Neues Referenz-Logo hochladen
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Firmenname *
              </label>
              <input
                className={inputClass}
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="z.B. Adelholzener"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Logo (PNG/SVG/JPG) *
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
              {saving ? "Wird hochgeladen..." : "Hinzufügen"}
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setAddName("");
              }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/[0.08] text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <IconX className="size-3.5" />
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {logos.length === 0 ? (
        <div className="rounded-xl border border-white/[0.10] bg-card p-8 text-center">
          <p className="text-sm text-zinc-400">
            Noch keine Referenz-Logos vorhanden.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="rounded-xl border border-white/[0.10] bg-card overflow-hidden group"
            >
              <div className="aspect-[2/1] bg-white flex items-center justify-center p-4">
                <img
                  src={`/api/uploads/client-logos/${logo.filename}`}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-200 truncate">
                  {logo.name}
                </h3>
                <button
                  onClick={() => handleDelete(logo.id, logo.name)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/[0.06] transition-colors opacity-0 group-hover:opacity-100"
                  title="Löschen"
                >
                  <IconTrash className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
