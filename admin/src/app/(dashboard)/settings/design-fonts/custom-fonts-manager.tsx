"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { IconUpload, IconTrash, IconX } from "@tabler/icons-react";

type CustomFont = {
  id: string;
  family: string;
  category: string;
  fileUrl: string;
  weight: number;
  style: string;
  createdAt: string;
};

export function CustomFontsManager({ initialFonts }: { initialFonts: CustomFont[] }) {
  const [fonts, setFonts] = useState(initialFonts);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group fonts by family
  const families = new Map<string, CustomFont[]>();
  for (const f of fonts) {
    const group = families.get(f.family) ?? [];
    group.push(f);
    families.set(f.family, group);
  }

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (!fileArr.length) return;

    const validExts = [".ttf", ".otf", ".woff", ".woff2"];
    const valid = fileArr.filter((f) => validExts.some((ext) => f.name.toLowerCase().endsWith(ext)));
    if (valid.length === 0) {
      toast.error("Keine gültigen Schriftdateien (.ttf, .otf, .woff, .woff2)");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      for (const f of valid) formData.append("files", f);

      const res = await fetch("/api/design/fonts/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload fehlgeschlagen");
        return;
      }

      if (data.errors?.length) {
        for (const err of data.errors) toast.error(err);
      }

      if (data.uploaded?.length) {
        toast.success(`${data.uploaded.length} Schrift${data.uploaded.length > 1 ? "en" : ""} hochgeladen`);
        // Reload page to get fresh data
        window.location.reload();
      }
    } catch {
      toast.error("Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }, []);

  async function deleteFont(id: string, family: string) {
    if (!confirm(`Schrift "${family}" wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/design/fonts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setFonts((prev) => prev.filter((f) => f.id !== id));
      toast.success("Schrift gelöscht");
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }

  const weightLabels: Record<number, string> = {
    100: "Thin",
    200: "ExtraLight",
    300: "Light",
    400: "Regular",
    500: "Medium",
    600: "SemiBold",
    700: "Bold",
    800: "ExtraBold",
    900: "Black",
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-border bg-foreground/[0.02]"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <IconUpload className="size-10 text-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-foreground/60">
          {uploading ? (
            "Wird hochgeladen..."
          ) : (
            <>
              <span className="text-primary font-medium">Schriftdateien auswählen</span> oder hier hinziehen
            </>
          )}
        </p>
        <p className="text-xs text-foreground/30 mt-2">
          .ttf, .otf, .woff, .woff2 — mehrere Dateien gleichzeitig möglich
        </p>
      </div>

      {/* Font list */}
      {families.size === 0 ? (
        <div className="text-center py-12 text-foreground/30 text-sm">
          Noch keine eigenen Schriften hochgeladen
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider">
            {families.size} Schriftfamilie{families.size !== 1 ? "n" : ""} ({fonts.length} Datei{fonts.length !== 1 ? "en" : ""})
          </h2>
          <div className="grid gap-3">
            {Array.from(families.entries()).map(([family, variants]) => (
              <FontFamilyCard
                key={family}
                family={family}
                variants={variants}
                weightLabels={weightLabels}
                onDelete={deleteFont}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FontFamilyCard({
  family,
  variants,
  weightLabels,
  onDelete,
}: {
  family: string;
  variants: CustomFont[];
  weightLabels: Record<number, string>;
  onDelete: (id: string, family: string) => void;
}) {
  // Load font for preview
  const cssRules = variants
    .map(
      (v) =>
        `@font-face { font-family: "custom-${family}"; src: url("${v.fileUrl}"); font-weight: ${v.weight}; font-style: ${v.style}; }`
    )
    .join("\n");

  return (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-4">
      <style dangerouslySetInnerHTML={{ __html: cssRules }} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground/90">{family}</h3>
          <p
            className="text-2xl mt-1 text-foreground/70 truncate"
            style={{ fontFamily: `"custom-${family}", sans-serif` }}
          >
            Knipserl — Das Erlebnis zählt!
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {variants.map((v) => (
              <span
                key={v.id}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-foreground/[0.05] text-foreground/50"
              >
                {weightLabels[v.weight] ?? v.weight} {v.style === "italic" ? "Italic" : ""}
                <button
                  onClick={() => onDelete(v.id, `${family} ${weightLabels[v.weight] ?? v.weight}`)}
                  className="ml-0.5 text-foreground/30 hover:text-red-400 transition-colors"
                  title="Variante löschen"
                >
                  <IconX className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
        {variants.length === 1 && (
          <button
            onClick={() => onDelete(variants[0].id, family)}
            className="shrink-0 p-2 rounded-lg text-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Schrift löschen"
          >
            <IconTrash className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
