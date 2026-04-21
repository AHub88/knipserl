"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconUpload,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconEye,
  IconEyeOff,
  IconExternalLink,
} from "@tabler/icons-react";
import { toast } from "sonner";

type PhotoUrls = {
  original: string;
  avif: string | null;
  webp: string | null;
};

type Photo = {
  id: string;
  alt: string;
  width: number;
  height: number;
  sortOrder: number;
  active: boolean;
  originalFilename: string;
  urls: PhotoUrls;
};

const inputClass =
  "h-9 w-full rounded-lg border border-white/[0.08] bg-[#1c1d20] px-3 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors";

export function ImpressionsManager({ initialPhotos }: { initialPhotos: Photo[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress({ done: 0, total: files.length });

    const uploaded: Photo[] = [];
    let done = 0;
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt", "");
        const res = await fetch("/api/impressions", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Fehler bei ${file.name}`);
        }
        const photo = (await res.json()) as Photo;
        uploaded.push(photo);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Fehler bei ${file.name}`);
      } finally {
        done += 1;
        setProgress({ done, total: files.length });
      }
    }

    setPhotos((prev) => [...prev, ...uploaded]);
    setProgress(null);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (uploaded.length > 0) {
      toast.success(`${uploaded.length} Bild${uploaded.length === 1 ? "" : "er"} hochgeladen`);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bild wirklich löschen? Das Original wird ebenfalls entfernt.")) return;
    try {
      const res = await fetch(`/api/impressions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Bild gelöscht");
      router.refresh();
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  async function handleAltChange(id: string, alt: string) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, alt } : p)));
  }

  async function handleAltBlur(id: string, alt: string) {
    try {
      await fetch(`/api/impressions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt }),
      });
    } catch {
      toast.error("Alt-Text konnte nicht gespeichert werden");
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    const next = !active;
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, active: next } : p)));
    try {
      await fetch(`/api/impressions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
    } catch {
      toast.error("Status konnte nicht geändert werden");
      setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, active } : p)));
    }
  }

  async function persistOrder(list: Photo[]) {
    try {
      await fetch("/api/impressions/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: list.map((p) => p.id) }),
      });
    } catch {
      toast.error("Reihenfolge konnte nicht gespeichert werden");
    }
  }

  function move(idx: number, delta: number) {
    const target = idx + delta;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[idx], next[target]] = [next[target], next[idx]];
    setPhotos(next);
    void persistOrder(next);
  }

  return (
    <div className="space-y-4">
      {/* Upload bar */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs text-zinc-400 mb-1">
            Bilder hochladen (Mehrfachauswahl, max. 25 MB je Datei)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
            className="h-9 w-full text-sm text-zinc-400 file:mr-3 file:h-9 file:rounded-lg file:border-0 file:bg-[#F6A11C] file:px-4 file:text-sm file:font-semibold file:text-black hover:file:bg-[#F6A11C]/90 transition-colors disabled:opacity-50"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          {progress && (
            <span className="flex items-center gap-2">
              <IconUpload className="size-4 text-[#F6A11C]" />
              {progress.done} / {progress.total}
            </span>
          )}
          <span>{photos.length} Bilder gesamt</span>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="rounded-xl border border-white/[0.10] bg-card p-8 text-center">
          <p className="text-sm text-zinc-400">Noch keine Impressionen hochgeladen.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className={`rounded-xl border bg-card overflow-hidden ${
                photo.active ? "border-white/[0.10]" : "border-white/[0.05] opacity-60"
              }`}
            >
              <div className="relative aspect-[4/3] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.urls.original}
                  alt={photo.alt || "Impression"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[11px] text-zinc-300">
                  {photo.width}×{photo.height}
                </div>
                <a
                  href={photo.urls.original}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 text-zinc-300 hover:text-white"
                  title="Original öffnen"
                >
                  <IconExternalLink className="size-3.5" />
                </a>
              </div>
              <div className="p-3 space-y-2">
                <input
                  className={inputClass}
                  value={photo.alt}
                  placeholder="Alt-Text (SEO)"
                  onChange={(e) => handleAltChange(photo.id, e.target.value)}
                  onBlur={(e) => handleAltBlur(photo.id, e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Nach oben"
                    >
                      <IconArrowUp className="size-3.5" />
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === photos.length - 1}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Nach unten"
                    >
                      <IconArrowDown className="size-3.5" />
                    </button>
                    <span className="text-xs text-zinc-500 ml-1">#{idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(photo.id, photo.active)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                      title={photo.active ? "Verstecken" : "Veröffentlichen"}
                    >
                      {photo.active ? <IconEye className="size-3.5" /> : <IconEyeOff className="size-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-400/[0.06]"
                      title="Löschen"
                    >
                      <IconTrash className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
