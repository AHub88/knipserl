"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Canvas = any;
type Textbox = any;
type Group = any;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = {
  orderId: string;
  token: string;
  orderInfo: {
    customerName: string;
    eventType: string;
    eventDate: string;
    locationName: string;
  };
  existingDesign?: { canvasJson: any; submitted?: boolean } | null;
};

type Template = {
  id: string;
  name: string;
  format: string;
  thumbnail: string | null;
  canvasJson: any;
  category: string | null;
};

type FontDef = {
  family: string;
  category: string;
  weights: number[];
};

const CANVAS_W = 600;
const CANVAS_H = 1800;

const PRESET_COLORS = [
  { label: "Schwarz", value: "#000000" },
  { label: "Weiß", value: "#ffffff" },
  { label: "Gold", value: "#F6A11C" },
  { label: "Rot", value: "#dc2626" },
  { label: "Blau", value: "#2563eb" },
  { label: "Pink", value: "#ec4899" },
  { label: "Grün", value: "#16a34a" },
  { label: "Grau", value: "#6b7280" },
];

type Panel = "templates" | "text" | "upload" | null;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LayoutEditor({ orderId, token, orderInfo, existingDesign }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const fabricModRef = useRef<typeof import("fabric") | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [fonts, setFonts] = useState<FontDef[]>([]);
  const [fontCategories, setFontCategories] = useState<{ key: string; label: string }[]>([]);

  const [selectedFont, setSelectedFont] = useState("Montserrat");
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#000000");

  const [placeholderCount, setPlaceholderCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dirtyRef = useRef(false);
  const lastSavedJsonRef = useRef<string>("");

  // ---- Canvas init --------------------------------------------------------

  useEffect(() => {
    if (!canvasRef.current) return;

    let canvas: Canvas;
    let cancelled = false;

    (async () => {
      const fabric = await import("fabric");
      fabricModRef.current = fabric;
      if (cancelled || !canvasRef.current) return;

      canvas = new fabric.Canvas(canvasRef.current, {
        width: CANVAS_W,
        height: CANVAS_H,
        backgroundColor: "#ffffff",
        selection: true,
      });

      fabricRef.current = canvas;

      // Scale canvas to fit viewport
      fitCanvas(canvas);

      // Load existing design
      if (existingDesign?.canvasJson) {
        canvas.loadFromJSON(existingDesign.canvasJson as Record<string, any>).then(() => {
          canvas.renderAll();
          countPlaceholders(canvas);
          lastSavedJsonRef.current = JSON.stringify(canvas.toObject(["isPhotoPlaceholder"]));
        });
      }

      // Track changes
      const markDirty = () => {
        dirtyRef.current = true;
      };
      canvas.on("object:modified", markDirty);
      canvas.on("object:added", markDirty);
      canvas.on("object:removed", markDirty);

      // Handle resize
      const onResize = () => fitCanvas(canvas);
      window.addEventListener("resize", onResize);

      // Track selection for text editing
      canvas.on("selection:created", handleSelection);
      canvas.on("selection:updated", handleSelection);
    })();

    return () => {
      cancelled = true;
      if (canvas) {
        window.removeEventListener("resize", () => fitCanvas(canvas));
        canvas.dispose();
      }
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Fetch data ---------------------------------------------------------

  useEffect(() => {
    fetch("/api/design/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []))
      .catch(() => {});

    fetch("/api/design/fonts")
      .then((r) => r.json())
      .then((d) => {
        setFonts(d.fonts ?? []);
        setFontCategories(d.categories ?? []);
      })
      .catch(() => {});
  }, []);

  // ---- Auto-save ----------------------------------------------------------

  useEffect(() => {
    const interval = setInterval(() => {
      if (!dirtyRef.current || !fabricRef.current) return;
      dirtyRef.current = false;
      autoSave();
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const autoSave = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const json = canvas.toObject(["isPhotoPlaceholder"]);
    const jsonStr = JSON.stringify(json);
    if (jsonStr === lastSavedJsonRef.current) return;

    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/design/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvasJson: json }),
      });
      if (!res.ok) throw new Error();
      lastSavedJsonRef.current = jsonStr;
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }, [token]);

  // ---- Helpers ------------------------------------------------------------

  function fitCanvas(canvas: Canvas) {
    if (!wrapperRef.current) return;
    const wrapper = wrapperRef.current;
    const maxW = wrapper.clientWidth - 32;
    const maxH = wrapper.clientHeight - 32;
    const scale = Math.min(maxW / CANVAS_W, maxH / CANVAS_H, 1);

    const el = canvas.getElement().parentElement;
    if (el) {
      el.style.transform = `scale(${scale})`;
      el.style.transformOrigin = "top center";
    }
  }

  function countPlaceholders(canvas: Canvas) {
    let count = 0;
    canvas.getObjects().forEach((obj: any) => {
      if (obj.isPhotoPlaceholder) count++;
      if (obj.type === "group") {
        (obj as Group).getObjects().forEach((child: any) => {
          if (child.isPhotoPlaceholder) count++;
        });
      }
    });
    setPlaceholderCount(count);
  }

  function handleSelection() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active.type === "textbox") {
      const tb = active as Textbox;
      setSelectedFont(tb.fontFamily ?? "Montserrat");
      setFontSize(tb.fontSize ?? 40);
      setTextColor((tb.fill as string) ?? "#000000");
    }
  }

  // ---- Font loading -------------------------------------------------------

  async function loadFont(family: string) {
    const id = `gfont-${family.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) {
      await document.fonts.ready;
      return;
    }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
    document.head.appendChild(link);
    await document.fonts.ready;
  }

  // ---- Actions ------------------------------------------------------------

  async function loadTemplate(template: Template) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    await canvas.loadFromJSON(template.canvasJson as Record<string, any>);
    canvas.renderAll();
    countPlaceholders(canvas);
    dirtyRef.current = true;
  }

  async function addPhotoPlaceholder() {
    const canvas = fabricRef.current;
    if (!canvas || placeholderCount >= 3) return;

    const fabric = fabricModRef.current;
    if (!fabric) return;

    const rect = new fabric.Rect({
      width: 500,
      height: 400,
      fill: "#e5e7eb",
      stroke: "#9ca3af",
      strokeDashArray: [8, 4],
      strokeWidth: 2,
      rx: 8,
      ry: 8,
    });

    const label = new fabric.Textbox("Foto", {
      width: 500,
      fontSize: 36,
      fill: "#9ca3af",
      textAlign: "center",
      fontFamily: "sans-serif",
      editable: false,
      top: 170,
    });

    const group = new fabric.Group([rect, label], {
      left: (CANVAS_W - 500) / 2,
      top: 100 + placeholderCount * 450,
    });

    (group as any).isPhotoPlaceholder = true;

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    setPlaceholderCount((c) => c + 1);
    dirtyRef.current = true;
  }

  async function addText() {
    const canvas = fabricRef.current;
    if (!canvas) return;

    await loadFont(selectedFont);

    const fabric = fabricModRef.current;
    if (!fabric) return;

    const text = new fabric.Textbox("Text hier eingeben", {
      left: 50,
      top: 200,
      width: 500,
      fontSize: fontSize,
      fontFamily: selectedFont,
      fill: textColor,
      textAlign: "center",
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    dirtyRef.current = true;
  }

  async function updateSelectedFont(family: string) {
    setSelectedFont(family);
    await loadFont(family);
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active.type === "textbox") {
      (active as Textbox).set("fontFamily", family);
      canvas.renderAll();
      dirtyRef.current = true;
    }
  }

  function updateSelectedFontSize(size: number) {
    setFontSize(size);
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active.type === "textbox") {
      (active as Textbox).set("fontSize", size);
      canvas.renderAll();
      dirtyRef.current = true;
    }
  }

  function updateSelectedColor(color: string) {
    setTextColor(color);
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active.type === "textbox") {
      (active as Textbox).set("fill", color);
      canvas.renderAll();
      dirtyRef.current = true;
    }
  }

  function deleteSelected() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    // Don't delete photo placeholders
    if ((active as any).isPhotoPlaceholder) return;
    canvas.remove(active);
    canvas.renderAll();
    dirtyRef.current = true;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`/api/design/${token}/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      const canvas = fabricRef.current;
      if (!canvas) return;

      const fabric = fabricModRef.current;
      if (!fabric) return;
      const img = await fabric.FabricImage.fromURL(data.url, { crossOrigin: "anonymous" });
      // Scale to fit canvas width
      const maxW = CANVAS_W * 0.8;
      if (img.width && img.width > maxW) {
        img.scaleToWidth(maxW);
      }
      img.set({ left: 50, top: 100 });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      dirtyRef.current = true;
    } catch {
      alert("Fehler beim Hochladen. Bitte versuche es erneut.");
    }

    // Reset input
    e.target.value = "";
  }

  async function handleSaveNow() {
    dirtyRef.current = true;
    await autoSave();
  }

  async function handleSubmit() {
    const canvas = fabricRef.current;
    if (!canvas) return;

    setSubmitting(true);
    try {
      // Save canvas JSON first
      dirtyRef.current = true;
      await autoSave();

      // Export to PNG blob
      const dataUrl = canvas.toDataURL({
        format: "png",
        multiplier: 2,
      });

      // Convert data URL to blob
      const resp = await fetch(dataUrl);
      const blob = await resp.blob();

      const form = new FormData();
      form.append("file", blob, "layout.png");

      const res = await fetch(`/api/design/${token}`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error();

      setSubmitted(true);
    } catch {
      alert("Fehler beim Absenden. Bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Keyboard shortcuts -------------------------------------------------

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Only delete if not editing text
        const active = fabricRef.current?.getActiveObject();
        if (active && active.type === "textbox" && (active as Textbox).isEditing) return;
        if (active && active.type !== "textbox") {
          deleteSelected();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ---- Submitted state ----------------------------------------------------

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-5xl">&#10003;</div>
          <h1 className="text-2xl font-bold text-white">Design abgesendet!</h1>
          <p className="text-white/60">
            Vielen Dank, {orderInfo.customerName}! Wir haben dein Layout erhalten
            und melden uns bei dir.
          </p>
        </div>
      </div>
    );
  }

  // ---- Render -------------------------------------------------------------

  return (
    <>
      {/* Mobile warning */}
      <div className="md:hidden flex items-center justify-center min-h-[60vh] p-6">
        <div className="text-center space-y-4">
          <p className="text-lg text-white/80">
            Bitte verwende ein Tablet oder einen Computer für den Layout-Editor.
          </p>
        </div>
      </div>

      {/* Editor (hidden on mobile) */}
      <div className="hidden md:flex flex-col h-[calc(100vh-56px)]">
        {/* Toolbar */}
        <div className="h-12 border-b border-white/10 bg-[#222326] flex items-center gap-2 px-4 shrink-0">
          <ToolbarButton
            active={activePanel === "templates"}
            onClick={() => setActivePanel(activePanel === "templates" ? null : "templates")}
          >
            Vorlagen
          </ToolbarButton>
          <ToolbarButton onClick={addPhotoPlaceholder} disabled={placeholderCount >= 3}>
            Foto-Platzhalter ({placeholderCount}/3)
          </ToolbarButton>
          <ToolbarButton
            active={activePanel === "text"}
            onClick={() => setActivePanel(activePanel === "text" ? null : "text")}
          >
            Text
          </ToolbarButton>
          <ToolbarButton
            active={activePanel === "upload"}
            onClick={() => setActivePanel(activePanel === "upload" ? null : "upload")}
          >
            Bild hochladen
          </ToolbarButton>

          <div className="ml-auto flex items-center gap-3">
            {saveStatus === "saving" && (
              <span className="text-xs text-white/40">Speichert...</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-green-400">Gespeichert</span>
            )}
            {saveStatus === "error" && (
              <span className="text-xs text-red-400">Fehler beim Speichern</span>
            )}
            <ToolbarButton onClick={handleSaveNow}>Speichern</ToolbarButton>
            <ToolbarButton onClick={deleteSelected}>Entfernen</ToolbarButton>
          </div>
        </div>

        {/* Main area */}
        <div className="flex flex-1 min-h-0">
          {/* Side panel */}
          {activePanel && (
            <div className="w-[280px] shrink-0 border-r border-white/10 bg-[#222326] overflow-y-auto p-4">
              {activePanel === "templates" && (
                <TemplatesPanel templates={templates} onSelect={loadTemplate} />
              )}
              {activePanel === "text" && (
                <TextPanel
                  fonts={fonts}
                  fontCategories={fontCategories}
                  selectedFont={selectedFont}
                  fontSize={fontSize}
                  textColor={textColor}
                  onFontChange={updateSelectedFont}
                  onSizeChange={updateSelectedFontSize}
                  onColorChange={updateSelectedColor}
                  onAdd={addText}
                />
              )}
              {activePanel === "upload" && (
                <UploadPanel onUpload={handleImageUpload} />
              )}
            </div>
          )}

          {/* Canvas area */}
          <div
            ref={wrapperRef}
            className="flex-1 flex items-start justify-center overflow-auto bg-[#1a1b1e] p-4"
          >
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-16 border-t border-white/10 bg-[#222326] flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-white/50">
            {orderInfo.customerName} &middot; {orderInfo.eventType} &middot;{" "}
            {orderInfo.eventDate} &middot; {orderInfo.locationName}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-[#F6A11C] hover:bg-[#e5950f] text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? "Wird gesendet..." : "Design absenden"}
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ToolbarButton({
  children,
  active,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-3 py-1.5 text-sm rounded-lg border transition-colors
        ${active ? "border-[#F6A11C] text-[#F6A11C]" : "border-white/10 text-white/70 hover:text-white hover:border-white/20"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Templates Panel
// ---------------------------------------------------------------------------

function TemplatesPanel({
  templates,
  onSelect,
}: {
  templates: Template[];
  onSelect: (t: Template) => void;
}) {
  if (templates.length === 0) {
    return <p className="text-white/40 text-sm">Keine Vorlagen verfügbar.</p>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/80">Vorlagen</h3>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className="rounded-lg border border-white/10 hover:border-[#F6A11C] transition-colors overflow-hidden text-left"
          >
            {t.thumbnail ? (
              <img
                src={t.thumbnail}
                alt={t.name}
                className="w-full aspect-[1/3] object-cover bg-white"
              />
            ) : (
              <div className="w-full aspect-[1/3] bg-white/5 flex items-center justify-center">
                <span className="text-xs text-white/30">Vorschau</span>
              </div>
            )}
            <div className="p-1.5">
              <span className="text-xs text-white/60 truncate block">{t.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Text Panel
// ---------------------------------------------------------------------------

function TextPanel({
  fonts,
  fontCategories,
  selectedFont,
  fontSize,
  textColor,
  onFontChange,
  onSizeChange,
  onColorChange,
  onAdd,
}: {
  fonts: FontDef[];
  fontCategories: { key: string; label: string }[];
  selectedFont: string;
  fontSize: number;
  textColor: string;
  onFontChange: (f: string) => void;
  onSizeChange: (s: number) => void;
  onColorChange: (c: string) => void;
  onAdd: () => void;
}) {
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const filtered = filterCat ? fonts.filter((f) => f.category === filterCat) : fonts;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/80">Text</h3>

      <button
        onClick={onAdd}
        className="w-full py-2 rounded-lg bg-[#F6A11C] hover:bg-[#e5950f] text-black font-semibold text-sm transition-colors"
      >
        Text hinzufügen
      </button>

      {/* Font picker */}
      <div>
        <label className="text-xs text-white/50 block mb-1">Schriftart</label>
        <div className="flex gap-1 flex-wrap mb-2">
          <FilterChip active={filterCat === null} onClick={() => setFilterCat(null)}>
            Alle
          </FilterChip>
          {fontCategories.map((c) => (
            <FilterChip
              key={c.key}
              active={filterCat === c.key}
              onClick={() => setFilterCat(c.key)}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
        <select
          value={selectedFont}
          onChange={(e) => onFontChange(e.target.value)}
          className="w-full rounded-lg bg-[#1a1b1e] border border-white/10 text-white text-sm px-3 py-2"
        >
          {filtered.map((f) => (
            <option key={f.family} value={f.family}>
              {f.family}
            </option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div>
        <label className="text-xs text-white/50 block mb-1">
          Schriftgröße: {fontSize}px
        </label>
        <input
          type="range"
          min={12}
          max={120}
          value={fontSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-full accent-[#F6A11C]"
        />
      </div>

      {/* Colors */}
      <div>
        <label className="text-xs text-white/50 block mb-1">Farbe</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => onColorChange(c.value)}
              title={c.label}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                textColor === c.value ? "border-[#F6A11C] scale-110" : "border-white/20"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded text-xs transition-colors ${
        active
          ? "bg-[#F6A11C] text-black"
          : "bg-white/5 text-white/50 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Upload Panel
// ---------------------------------------------------------------------------

function UploadPanel({
  onUpload,
}: {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/80">Bild hochladen</h3>
      <p className="text-xs text-white/40">
        PNG, JPG oder WebP, max. 5 MB.
      </p>
      <label className="block w-full py-8 rounded-lg border-2 border-dashed border-white/20 hover:border-[#F6A11C] transition-colors cursor-pointer text-center">
        <span className="text-sm text-white/60">Klicke hier oder ziehe eine Datei</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onUpload}
          className="hidden"
        />
      </label>
    </div>
  );
}
