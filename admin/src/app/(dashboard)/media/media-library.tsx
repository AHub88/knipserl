"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconUpload,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconExternalLink,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";

type Asset = {
  id: string;
  alt: string;
  width: number;
  height: number;
  fileSize: number;
  active: boolean;
  originalFilename: string;
  createdAt: string;
  urls: {
    original: string;
    avif: string | null;
    webp: string | null;
  };
};

const inputClass =
  "h-9 w-full rounded-lg border border-white/[0.08] bg-[#1c1d20] px-3 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors";

function formatBytes(bytes: number) {
  if (bytes === 0) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ initialAssets }: { initialAssets: Asset[] }) {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssets = useMemo(() => {
    if (!query.trim()) return assets;
    const q = query.trim().toLowerCase();
    return assets.filter(
      (a) =>
        a.alt.toLowerCase().includes(q) ||
        a.originalFilename.toLowerCase().includes(q)
    );
  }, [assets, query]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress({ done: 0, total: files.length });

    const uploaded: Asset[] = [];
    let done = 0;
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt", "");
        const res = await fetch("/api/media", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Fehler bei ${file.name}`);
        }
        const asset = (await res.json()) as Asset;
        uploaded.push(asset);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Fehler bei ${file.name}`);
      } finally {
        done += 1;
        setProgress({ done, total: files.length });
      }
    }

    setAssets((prev) => [...uploaded, ...prev]);
    setProgress(null);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (uploaded.length > 0) {
      toast.success(`${uploaded.length} Bild${uploaded.length === 1 ? "" : "er"} hochgeladen`);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bild wirklich löschen? Das Original und alle Varianten werden entfernt.")) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Löschen fehlgeschlagen");
      }
      setAssets((prev) => prev.filter((a) => a.id !== id));
      toast.success("Bild gelöscht");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Löschen");
    }
  }

  function handleAltChange(id: string, alt: string) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, alt } : a)));
  }

  async function handleAltBlur(id: string, alt: string) {
    try {
      await fetch(`/api/media/${id}`, {
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
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, active: next } : a)));
    try {
      await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
    } catch {
      toast.error("Status konnte nicht geändert werden");
      setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, active } : a)));
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload + search bar */}
      <div className="rounded-xl border border-white/[0.10] bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end gap-3">
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
        <div className="sm:w-64">
          <label className="block text-xs text-zinc-400 mb-1">Suche</label>
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            <input
              className={inputClass + " pl-8"}
              placeholder="Alt-Text oder Dateiname..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300"
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-500 sm:ml-2">
          {progress && (
            <span className="flex items-center gap-2">
              <IconUpload className="size-4 text-[#F6A11C]" />
              {progress.done} / {progress.total}
            </span>
          )}
          <span className="whitespace-nowrap">
            {filteredAssets.length}
            {filteredAssets.length !== assets.length && ` / ${assets.length}`}
          </span>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-white/[0.10] bg-card p-8 text-center">
          <p className="text-sm text-zinc-400">Medienbibliothek ist noch leer.</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="rounded-xl border border-white/[0.10] bg-card p-8 text-center">
          <p className="text-sm text-zinc-400">Keine Treffer für &quot;{query}&quot;.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={`rounded-xl border bg-card overflow-hidden ${
                asset.active ? "border-white/[0.10]" : "border-white/[0.05] opacity-60"
              }`}
            >
              <div className="relative aspect-[4/3] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.urls.original}
                  alt={asset.alt || "Medium"}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[11px] text-zinc-300 pointer-events-none">
                  {asset.width}×{asset.height}
                  {asset.fileSize > 0 && ` · ${formatBytes(asset.fileSize)}`}
                </div>
                <a
                  href={asset.urls.original}
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
                  value={asset.alt}
                  placeholder="Alt-Text (SEO)"
                  onChange={(e) => handleAltChange(asset.id, e.target.value)}
                  onBlur={(e) => handleAltBlur(asset.id, e.target.value)}
                />
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleToggleActive(asset.id, asset.active)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    title={asset.active ? "Verstecken" : "Veröffentlichen"}
                  >
                    {asset.active ? <IconEye className="size-3.5" /> : <IconEyeOff className="size-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-400/[0.06]"
                    title="Löschen"
                  >
                    <IconTrash className="size-3.5" />
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
