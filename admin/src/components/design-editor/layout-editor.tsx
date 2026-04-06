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
  format: string;
  orderInfo: {
    customerName: string;
    eventType: string;
    eventDate: string;
    locationName: string;
  };
  existingDesign?: { canvasJson: any; submitted?: boolean } | null;
  mode?: "customer" | "admin";
  onSaveTemplate?: (canvasJson: any, thumbnailDataUrl: string | null) => void;
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

function getCanvasDimensions(format: string) {
  if (format === "4x6") return { width: 1800, height: 1200 }; // 10x15cm landscape
  return { width: 600, height: 1800 }; // 2x6 (5x15cm Fotostreifen portrait)
}

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

type DesignElementItem = {
  id: string;
  name: string;
  imageUrl: string;
  category: string | null;
};

type UploadMode = "background" | "element";
type Panel = "templates" | "text" | "upload" | "elements" | null;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LayoutEditor({ orderId, token, format, orderInfo, existingDesign, mode = "customer", onSaveTemplate }: Props) {
  const { width: CANVAS_W, height: CANVAS_H } = getCanvasDimensions(format);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const fabricModRef = useRef<typeof import("fabric") | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [designElements, setDesignElements] = useState<DesignElementItem[]>([]);
  const [fonts, setFonts] = useState<FontDef[]>([]);
  const [fontCategories, setFontCategories] = useState<{ key: string; label: string }[]>([]);

  const [selectedFont, setSelectedFont] = useState("Montserrat");
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#000000");

  const [placeholderCount, setPlaceholderCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [zoom, setZoom] = useState(1.0);

  const dirtyRef = useRef(false);
  const lastSavedJsonRef = useRef<string>("");
  const formatRef = useRef(format);

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
      fitCanvas(canvas, 1);

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
      const onResize = () => fitCanvas(canvas, 1);
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

    fetch("/api/design/elements")
      .then((r) => r.json())
      .then((d) => setDesignElements(d.elements ?? []))
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
    if (mode === "admin") return; // No auto-save in admin mode
    const interval = setInterval(() => {
      if (!dirtyRef.current || !fabricRef.current) return;
      dirtyRef.current = false;
      autoSave();
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, mode]);

  // ---- Zoom effect --------------------------------------------------------

  useEffect(() => {
    if (fabricRef.current) fitCanvas(fabricRef.current, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

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

  function fitCanvas(canvas: Canvas, zoomLevel: number = 1) {
    if (!wrapperRef.current) return;
    const wrapper = wrapperRef.current;
    const maxW = wrapper.clientWidth - 32;
    const maxH = wrapper.clientHeight - 32;
    const baseScale = Math.min(maxW / CANVAS_W, maxH / CANVAS_H, 0.6);
    const scale = baseScale * zoomLevel;

    if (canvasWrapRef.current) {
      canvasWrapRef.current.style.transform = `scale(${scale})`;
    }
  }

  function countPlaceholders(canvas: Canvas) {
    let count = 0;
    canvas.getObjects().forEach((obj: any) => {
      if (obj.isPhotoPlaceholder) count++;
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
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
      document.head.appendChild(link);
    }
    // Wait for the specific font to be loaded
    try {
      await document.fonts.load(`16px "${family}"`);
    } catch { /* ignore */ }
    await document.fonts.ready;
  }

  // ---- Actions ------------------------------------------------------------

  async function loadTemplate(template: Template) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const fabric = fabricModRef.current;
    if (!fabric) return;

    const json = template.canvasJson as Record<string, any>;

    // If canvasJson has a backgroundImage, load the template normally
    if (json && json.backgroundImage) {
      await canvas.loadFromJSON(json);
      canvas.renderAll();
    } else if (json && json.objects && json.objects.length > 0) {
      // Has objects but no background - load as normal
      await canvas.loadFromJSON(json);
      canvas.renderAll();
    } else if (template.thumbnail) {
      // Empty/minimal canvasJson but has a thumbnail - use as background
      canvas.clear();
      canvas.backgroundColor = "#ffffff";
      const bgImg = await fabric.FabricImage.fromURL(template.thumbnail, { crossOrigin: "anonymous" });
      if (bgImg.width && bgImg.height) {
        bgImg.scaleX = CANVAS_W / bgImg.width;
        bgImg.scaleY = CANVAS_H / bgImg.height;
      }
      canvas.backgroundImage = bgImg;
      canvas.renderAll();
    } else {
      // Fallback - just load the JSON
      await canvas.loadFromJSON(json);
      canvas.renderAll();
    }

    countPlaceholders(canvas);
    dirtyRef.current = true;
  }

  async function addPhotoPlaceholder() {
    const canvas = fabricRef.current;
    if (!canvas || placeholderCount >= 3) return;

    const fabric = fabricModRef.current;
    if (!fabric) return;

    const colors = ["#3b82f6", "#f59e0b", "#10b981"]; // blue, amber, green
    const color = colors[placeholderCount % colors.length];
    const num = placeholderCount + 1;
    const placeholderW = Math.min(500, CANVAS_W - 100);
    const placeholderH = Math.round(placeholderW * (2 / 3)); // 3:2 Seitenverhältnis

    const rect = new fabric.Rect({
      width: placeholderW,
      height: placeholderH,
      fill: color,
      stroke: "#ffffff",
      strokeWidth: 3,
      rx: 0,
      ry: 0,
      originX: "center",
      originY: "center",
    });

    const label = new fabric.Text(`FOTO ${num}`, {
      fontSize: 48,
      fontWeight: "bold",
      fill: "#ffffff",
      fontFamily: "sans-serif",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    const group = new fabric.Group([rect, label], {
      left: (CANVAS_W - placeholderW) / 2,
      top: 100 + placeholderCount * (placeholderH + 50),
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
      const tb = active as Textbox;
      tb.set("fontFamily", family);
      tb.set("dirty", true);
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
    // In customer mode, don't delete photo placeholders
    if (mode !== "admin" && (active as any).isPhotoPlaceholder) return;
    canvas.remove(active);
    canvas.renderAll();
    countPlaceholders(canvas);
    dirtyRef.current = true;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, uploadMode: UploadMode = "element") {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const uploadUrl = mode === "admin" ? "/api/uploads/design" : `/api/design/${token}/upload`;
      const res = await fetch(uploadUrl, {
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

      const { width: canvasW, height: canvasH } = getCanvasDimensions(formatRef.current);

      if (uploadMode === "background") {
        // Make canvas background transparent so PNG transparency shows through
        canvas.backgroundColor = "transparent";
        // Scale to fill the entire canvas
        if (img.width && img.height) {
          const scaleX = canvasW / img.width;
          const scaleY = canvasH / img.height;
          const fillScale = Math.max(scaleX, scaleY);
          img.set({
            scaleX: fillScale,
            scaleY: fillScale,
            left: 0,
            top: 0,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasControls: false,
          });
          (img as any).isBackground = true;
        }
        canvas.add(img);
        canvas.sendObjectToBack(img);
      } else {
        // Scale to fit canvas width at 80%
        const maxW = canvasW * 0.8;
        if (img.width && img.width > maxW) {
          img.scaleToWidth(maxW);
        }
        img.set({ left: 50, top: 100 });
        canvas.add(img);
        canvas.setActiveObject(img);
      }

      canvas.renderAll();
      dirtyRef.current = true;
    } catch {
      alert("Fehler beim Hochladen. Bitte versuche es erneut.");
    }

    // Reset input
    e.target.value = "";
  }

  async function addDesignElement(element: DesignElementItem) {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const fabric = fabricModRef.current;
    if (!fabric) return;

    try {
      const img = await fabric.FabricImage.fromURL(element.imageUrl, { crossOrigin: "anonymous" });
      const maxW = CANVAS_W * 0.6;
      if (img.width && img.width > maxW) {
        img.scaleToWidth(maxW);
      }
      img.set({ left: 50, top: 100 });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      dirtyRef.current = true;
    } catch {
      alert("Fehler beim Laden des Elements.");
    }
  }

  async function handleSaveNow() {
    if (mode === "admin" && onSaveTemplate && fabricRef.current) {
      const thumb = fabricRef.current.toDataURL({ format: "png", multiplier: 0.25 });
      onSaveTemplate(fabricRef.current.toObject(["isPhotoPlaceholder"]), thumb);
      return;
    }
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
        <div className="h-11 border-b border-white/10 bg-[#222326] flex items-center px-3 shrink-0">
          {/* Left: Add tools */}
          <div className="flex items-center gap-1.5">
            <ToolbarButton active={activePanel === "templates"} onClick={() => setActivePanel(activePanel === "templates" ? null : "templates")}>Vorlagen</ToolbarButton>
            <ToolbarButton onClick={addPhotoPlaceholder} disabled={placeholderCount >= 3}>Foto ({placeholderCount}/3)</ToolbarButton>
            <ToolbarButton active={activePanel === "text"} onClick={() => setActivePanel(activePanel === "text" ? null : "text")}>Text</ToolbarButton>
            <ToolbarButton active={activePanel === "upload"} onClick={() => setActivePanel(activePanel === "upload" ? null : "upload")}>Bild</ToolbarButton>
            <ToolbarButton active={activePanel === "elements"} onClick={() => setActivePanel(activePanel === "elements" ? null : "elements")}>Elemente</ToolbarButton>
          </div>

          {/* Center: Zoom */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1 border border-white/10 rounded-lg px-1">
              <ToolbarButton onClick={() => setZoom(z => Math.max(0.25, z * 0.8))}>&minus;</ToolbarButton>
              <span className="text-xs text-white/50 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <ToolbarButton onClick={() => setZoom(z => Math.min(3, z * 1.25))}>+</ToolbarButton>
            </div>
          </div>

          {/* Right: Save + Status */}
          <div className="flex items-center gap-2">
            {saveStatus === "saving" && <span className="text-xs text-white/40">Speichert...</span>}
            {saveStatus === "saved" && <span className="text-xs text-green-400">Gespeichert</span>}
            {saveStatus === "error" && <span className="text-xs text-red-400">Fehler</span>}
            <ToolbarButton onClick={handleSaveNow}>Speichern</ToolbarButton>
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
                <UploadPanel onUpload={(e, uploadMode) => handleImageUpload(e, uploadMode)} />
              )}
              {activePanel === "elements" && (
                <ElementsPanel elements={designElements} onSelect={addDesignElement} />
              )}
            </div>
          )}

          {/* Canvas area */}
          <div
            ref={wrapperRef}
            className="flex-1 flex items-start justify-center overflow-auto bg-[#1a1b1e] p-4"
          >
            <div ref={canvasWrapRef} className="shadow-2xl shadow-black/50 border border-white/20" style={{ transformOrigin: "top center", backgroundImage: "repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%)", backgroundSize: "16px 16px" }}>
              <canvas ref={canvasRef} />
            </div>
          </div>

          {/* Layers panel (right sidebar) */}
          <LayersPanel
            fabricRef={fabricRef}
            fabricModRef={fabricModRef}
            onUpdate={() => { fabricRef.current?.renderAll(); dirtyRef.current = true; }}
          />
        </div>

        {/* Bottom bar */}
        <div className="h-16 border-t border-white/10 bg-[#222326] flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-white/50">
            {mode === "admin"
              ? `Admin-Modus · Format: ${format}`
              : `${orderInfo.customerName} · ${orderInfo.eventType} · ${orderInfo.eventDate} · ${orderInfo.locationName}`}
          </div>
          {mode === "admin" ? (
            <button
              onClick={() => {
                const canvas = fabricRef.current;
                if (!canvas || !onSaveTemplate) return;
                const thumb = canvas.toDataURL({ format: "png", multiplier: 0.25 });
                onSaveTemplate(canvas.toObject(["isPhotoPlaceholder"]), thumb);
              }}
              className="px-6 py-2 bg-[#F6A11C] hover:bg-[#e5950f] text-black font-semibold rounded-lg transition-colors"
            >
              Vorlage speichern
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-[#F6A11C] hover:bg-[#e5950f] text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? "Wird gesendet..." : "Design absenden"}
            </button>
          )}
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
                className="w-full h-28 object-contain bg-white/5"
              />
            ) : (
              <div className="w-full h-28 bg-white/5 flex items-center justify-center">
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

  // Load all fonts for current filter via a single <link> in <head>
  useEffect(() => {
    if (filtered.length === 0) return;
    const id = "gfonts-preview";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${filtered.map((f) => `family=${encodeURIComponent(f.family)}:wght@400;700`).join("&")}&display=swap`;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/80">Text</h3>

      <button
        onClick={onAdd}
        className="w-full py-2 rounded-lg bg-[#F6A11C] hover:bg-[#e5950f] text-black font-semibold text-sm transition-colors"
      >
        Text hinzufügen
      </button>

      {/* Font picker with live preview */}
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
        <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#1a1b1e]">
          {filtered.map((f) => (
            <button
              key={f.family}
              onClick={() => onFontChange(f.family)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors border-b border-white/5 last:border-0 ${
                selectedFont === f.family
                  ? "bg-[#F6A11C]/15 text-[#F6A11C]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              style={{ fontFamily: `"${f.family}", sans-serif` }}
            >
              {f.family}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div>
        <label className="text-xs text-white/50 block mb-1">
          Schriftgröße: {fontSize}px
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={12}
            max={120}
            value={fontSize}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="flex-1 accent-[#F6A11C]"
          />
          <input
            type="number"
            min={8}
            max={200}
            value={fontSize}
            onChange={(e) => onSizeChange(Number(e.target.value) || 40)}
            className="w-14 rounded bg-[#1a1b1e] border border-white/10 text-white text-xs text-center px-1 py-1"
          />
        </div>
      </div>

      {/* Colors with picker + hex input */}
      <div>
        <label className="text-xs text-white/50 block mb-1">Farbe</label>
        <div className="flex flex-wrap gap-2 mb-2">
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
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={textColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onColorChange(v);
            }}
            placeholder="#000000"
            className="flex-1 rounded bg-[#1a1b1e] border border-white/10 text-white text-xs px-2 py-1.5 font-mono"
          />
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
// Elements Panel
// ---------------------------------------------------------------------------

function ElementsPanel({
  elements,
  onSelect,
}: {
  elements: DesignElementItem[];
  onSelect: (e: DesignElementItem) => void;
}) {
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const categories = Array.from(
    new Set(elements.map((e) => e.category).filter(Boolean))
  ) as string[];

  const filtered = filterCat
    ? elements.filter((e) => e.category === filterCat)
    : elements;

  if (elements.length === 0) {
    return <p className="text-white/40 text-sm">Keine Elemente verfügbar.</p>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/80">Elemente</h3>
      {categories.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          <FilterChip active={filterCat === null} onClick={() => setFilterCat(null)}>
            Alle
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c}
              active={filterCat === c}
              onClick={() => setFilterCat(c)}
            >
              {c}
            </FilterChip>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((el) => (
          <button
            key={el.id}
            onClick={() => onSelect(el)}
            className="rounded-lg border border-white/10 hover:border-[#F6A11C] transition-colors overflow-hidden text-left"
          >
            <div className="aspect-square bg-white/5 flex items-center justify-center p-2">
              <img
                src={el.imageUrl}
                alt={el.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-1.5">
              <span className="text-xs text-white/60 truncate block">{el.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload Panel
// ---------------------------------------------------------------------------

function UploadPanel({
  onUpload,
}: {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, mode: UploadMode) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/80">Bild hochladen</h3>
      <p className="text-xs text-white/40">
        PNG, JPG oder WebP, max. 5 MB.
      </p>
      <div className="space-y-2">
        <label className="block w-full py-4 rounded-lg border-2 border-dashed border-white/20 hover:border-[#F6A11C] transition-colors cursor-pointer text-center">
          <span className="text-sm text-white/60">Als Hintergrund (f&uuml;llt Canvas)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => onUpload(e, "background")}
            className="hidden"
          />
        </label>
        <label className="block w-full py-4 rounded-lg border-2 border-dashed border-white/20 hover:border-[#F6A11C] transition-colors cursor-pointer text-center">
          <span className="text-sm text-white/60">Als Element (frei platzierbar)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => onUpload(e, "element")}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layers Panel (right sidebar, Photoshop-style)
// ---------------------------------------------------------------------------

function LayersPanel({
  fabricRef,
  fabricModRef,
  onUpdate,
}: {
  fabricRef: React.RefObject<Canvas | null>;
  fabricModRef: React.RefObject<typeof import("fabric") | null>;
  onUpdate: () => void;
}) {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  const [shadowBlur, setShadowBlur] = useState(15);
  const [shadowOffsetX, setShadowOffsetX] = useState(5);
  const [shadowOffsetY, setShadowOffsetY] = useState(5);
  // Poll canvas every 500ms to always stay in sync
  useEffect(() => {
    const interval = setInterval(refresh, 500);
    return () => clearInterval(interval);
  }, []);

  const canvas = fabricRef.current;
  if (!canvas) return null;

  const objects = canvas.getObjects();
  const activeObj = canvas.getActiveObject();

  function detectKind(obj: any): "placeholder" | "background" | "text" | "image" | "group" | "rect" | "unknown" {
    if (obj.isPhotoPlaceholder) return "placeholder";
    if (obj.isBackground) return "background";
    // Check text by property existence (works regardless of type string)
    if (obj.text !== undefined && obj.fontFamily !== undefined) return "text";
    // Check image by src property or _element (fabric v6 internals)
    if (obj._src || obj._element || obj.getSrc || obj.src) return "image";
    if (typeof obj.getObjects === "function") return "group";
    if (obj.type === "rect" || (obj.width && obj.height && obj.fill && !obj.text)) return "rect";
    return "unknown";
  }

  function getLayerName(obj: any): string {
    const kind = detectKind(obj);
    switch (kind) {
      case "placeholder": {
        if (typeof obj.getObjects === "function") {
          const textChild = obj.getObjects().find((c: any) => c.text !== undefined);
          if (textChild?.text) return textChild.text;
        }
        return "Foto-Platzhalter";
      }
      case "background": return "Hintergrund";
      case "text": return `T: ${(obj.text || "").substring(0, 18) || "Text"}`;
      case "image": return obj.isBackground ? "Hintergrund" : "Bild";
      case "group": return "Gruppe";
      case "rect": return "Rechteck";
      default: return `Ebene (${obj.type || obj.constructor?.name || "?"})`;
    }
  }

  function getLayerColor(obj: any): string {
    const kind = detectKind(obj);
    switch (kind) {
      case "placeholder": return "#3b82f6";
      case "background": return "#8b5cf6";
      case "text": return "#f59e0b";
      case "image": return "#10b981";
      default: return "#6b7280";
    }
  }

  const reversed = [...objects].reverse();

  return (
    <div className="w-[200px] shrink-0 border-l border-white/10 bg-[#222326] flex flex-col">
      <div className="px-3 py-2 border-b border-white/10">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Ebenen</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {reversed.map((obj: any, revIdx: number) => {
          const realIdx = objects.length - 1 - revIdx;
          const isActive = obj === activeObj;
          const isVisible = obj.visible !== false;
          const color = getLayerColor(obj);
          return (
            <div
              key={revIdx}
              className={`flex items-center gap-1.5 px-2 py-2 text-[11px] cursor-pointer border-b border-white/5 transition-colors ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              } ${!isVisible ? "opacity-30" : ""}`}
              onClick={() => {
                canvas.setActiveObject(obj);
                canvas.renderAll();
                refresh();
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className={`flex-1 truncate ${isActive ? "text-white font-medium" : "text-white/60"}`}>
                {getLayerName(obj)}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    obj.set("visible", !isVisible);
                    onUpdate();
                    refresh();
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
                  title={isVisible ? "Ausblenden" : "Einblenden"}
                >
                  {isVisible ? (
                    <svg className="w-3.5 h-3.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Move up in z-order using official API
                    const idx = canvas.getObjects().indexOf(obj);
                    if (idx >= 0 && idx < canvas.getObjects().length - 1) {
                      canvas.remove(obj);
                      canvas.insertAt(idx + 1, obj);
                      canvas.setActiveObject(obj);
                      canvas.requestRenderAll();
                      onUpdate();
                      refresh();
                    }
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
                  title="Nach oben"
                >
                  <svg className="w-3.5 h-3.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = canvas.getObjects().indexOf(obj);
                    if (idx > 0) {
                      canvas.remove(obj);
                      canvas.insertAt(idx - 1, obj);
                      canvas.setActiveObject(obj);
                      canvas.requestRenderAll();
                      onUpdate();
                      refresh();
                    }
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
                  title="Nach unten"
                >
                  <svg className="w-3.5 h-3.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    canvas.remove(obj);
                    onUpdate();
                    refresh();
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20"
                  title="Löschen"
                >
                  <svg className="w-3.5 h-3.5 text-white/30 hover:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          );
        })}
        {objects.length === 0 && (
          <p className="text-[10px] text-white/30 p-3 text-center">Keine Ebenen</p>
        )}
      </div>

      {/* Actions for selected layer */}
      {activeObj && (
        <div className="shrink-0 border-t border-white/10 p-2 space-y-2">
          <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Auswahl</h4>
          {/* Shadow controls */}
          <div className="space-y-1.5">
            <div>
              <label className="text-[10px] text-white/50">Schatten: {shadowBlur}px</label>
              <input type="range" min={0} max={50} value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} className="w-full accent-[#F6A11C] h-1" />
            </div>
            <div className="flex gap-1.5">
              <div className="flex-1">
                <label className="text-[10px] text-white/50">X:{shadowOffsetX}</label>
                <input type="range" min={-30} max={30} value={shadowOffsetX} onChange={(e) => setShadowOffsetX(Number(e.target.value))} className="w-full accent-[#F6A11C] h-1" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-white/50">Y:{shadowOffsetY}</label>
                <input type="range" min={-30} max={30} value={shadowOffsetY} onChange={(e) => setShadowOffsetY(Number(e.target.value))} className="w-full accent-[#F6A11C] h-1" />
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => {
                const fabric = fabricModRef.current;
                if (!fabric) return;
                activeObj.set("shadow", new fabric.Shadow({ color: "rgba(0,0,0,0.4)", blur: shadowBlur, offsetX: shadowOffsetX, offsetY: shadowOffsetY }));
                onUpdate(); refresh();
              }} className="flex-1 py-1 text-[10px] font-semibold rounded bg-[#F6A11C] text-black">Schatten</button>
              <button onClick={() => {
                activeObj.set("shadow", null);
                onUpdate(); refresh();
              }} className="flex-1 py-1 text-[10px] font-semibold rounded border border-white/10 text-white/50">Kein Schatten</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
