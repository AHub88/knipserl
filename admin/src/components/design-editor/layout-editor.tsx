"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

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
type Modal = "elements" | "templates" | null;
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
  const [openModal, setOpenModal] = useState<Modal>(null);
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

  // Undo/Redo history
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);
  const MAX_HISTORY = 50;

  function pushHistory() {
    const canvas = fabricRef.current;
    if (!canvas || isUndoRedoRef.current) return;
    const json = JSON.stringify(canvas.toObject(["isPhotoPlaceholder", "isBackground"]));
    const idx = historyIndexRef.current;
    // Discard any future states
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(json);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  }

  function undo() {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current <= 0) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current -= 1;
    canvas.loadFromJSON(JSON.parse(historyRef.current[historyIndexRef.current])).then(() => {
      canvas.renderAll();
      countPlaceholders(canvas);
      isUndoRedoRef.current = false;
      dirtyRef.current = true;
    });
  }

  function redo() {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current += 1;
    canvas.loadFromJSON(JSON.parse(historyRef.current[historyIndexRef.current])).then(() => {
      canvas.renderAll();
      countPlaceholders(canvas);
      isUndoRedoRef.current = false;
      dirtyRef.current = true;
    });
  }

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
        preserveObjectStacking: true,
        perPixelTargetFind: true,
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

      // Track changes + push undo history
      const markDirty = () => {
        dirtyRef.current = true;
        pushHistory();
      };
      canvas.on("object:modified", markDirty);
      canvas.on("object:added", markDirty);
      canvas.on("object:removed", markDirty);

      // Initial history state
      pushHistory();

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

  async function loadFont(family: string, weight: number = 400, style: string = "normal") {
    const id = `gfont-${family.replace(/\s+/g, "-")}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
      document.head.appendChild(link);
    }
    // Wait for the specific variant to be loaded
    try {
      const spec = `${style} ${weight} 16px "${family}"`;
      await document.fonts.load(spec);
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
    if (!canvas) return;

    // Count existing placeholders from canvas (not from state)
    const existing = canvas.getObjects().filter((o: any) => o.isPhotoPlaceholder);
    if (existing.length >= 3) return;

    const fabric = fabricModRef.current;
    if (!fabric) return;

    // Find the next available number (1, 2, or 3)
    const usedNums = new Set<number>();
    existing.forEach((obj: any) => {
      if (typeof obj.getObjects === "function") {
        const textChild = obj.getObjects().find((c: any) => c.text !== undefined);
        if (textChild?.text) {
          const m = textChild.text.match(/(\d+)/);
          if (m) usedNums.add(Number(m[1]));
        }
      }
    });
    let num = 1;
    while (usedNums.has(num) && num <= 3) num++;

    const colors = ["#3b82f6", "#f59e0b", "#10b981"]; // blue, amber, green
    const color = colors[(num - 1) % colors.length];
    const placeholderW = Math.min(500, CANVAS_W - 100);
    const placeholderH = Math.round(placeholderW * (2 / 3));

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
      top: 100 + existing.length * (placeholderH + 50),
    });
    (group as any).isPhotoPlaceholder = true;

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    countPlaceholders(canvas);
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
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

      // Scale image to fit canvas (maintain aspect ratio)
      if (img.width && img.height) {
        const scaleX = canvasW / img.width;
        const scaleY = canvasH / img.height;
        const fitScale = Math.min(scaleX, scaleY);
        img.set({
          scaleX: fitScale,
          scaleY: fitScale,
          left: (canvasW - img.width * fitScale) / 2,
          top: (canvasH - img.height * fitScale) / 2,
        });
      }
      canvas.backgroundColor = "transparent";
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

      // Export preview PNG (with placeholders)
      const previewDataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
      const previewResp = await fetch(previewDataUrl);
      const previewBlob = await previewResp.blob();

      // Hide placeholders, export final PNG (without placeholders)
      const placeholders = canvas.getObjects().filter((o: any) => o.isPhotoPlaceholder);
      placeholders.forEach((o: any) => o.set("visible", false));
      canvas.renderAll();

      const finalDataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
      const finalResp = await fetch(finalDataUrl);
      const finalBlob = await finalResp.blob();

      // Restore placeholders
      placeholders.forEach((o: any) => o.set("visible", true));
      canvas.renderAll();

      const form = new FormData();
      form.append("file", finalBlob, "layout.png");
      form.append("preview", previewBlob, "layout-preview.png");

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
      const isEditing = (() => {
        const active = fabricRef.current?.getActiveObject();
        return active && active.type === "textbox" && (active as Textbox).isEditing;
      })();

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") || ((e.ctrlKey || e.metaKey) && e.key === "y")) {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (isEditing) return;
        const active = fabricRef.current?.getActiveObject();
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
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={undo} title="Rückgängig (Strg+Z)">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 0 1 0 10H9"/><path d="M3 10l4-4M3 10l4 4"/></svg>
                <span className="text-xs">Rückgängig</span>
              </span>
            </ToolbarButton>
            <ToolbarButton onClick={redo} title="Wiederherstellen (Strg+Shift+Z)">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10H11a5 5 0 0 0 0 10h4"/><path d="M21 10l-4-4M21 10l-4 4"/></svg>
                <span className="text-xs">Wiederherstellen</span>
              </span>
            </ToolbarButton>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <ToolbarButton onClick={deleteSelected} title="Löschen">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                <span className="text-xs">Löschen</span>
              </span>
            </ToolbarButton>
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
            <button onClick={handleSaveNow} className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-[#F6A11C] hover:bg-[#e5950f] text-black transition-colors">
              Speichern
            </button>
          </div>
        </div>

        {/* Hidden file input for image upload */}
        <input id="img-upload-hidden" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />

        {/* Main area: Left sidebar + Canvas + Right sidebar */}
        <div className="flex flex-1 min-h-0">

          {/* LEFT SIDEBAR: Add elements */}
          <div className="w-[180px] shrink-0 border-r border-white/10 bg-[#222326] flex flex-col overflow-y-auto">
            <div className="px-3 py-2 border-b border-white/10">
              <h3 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Hinzufügen</h3>
            </div>

            <SidebarButton
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 16l5-5 4 4 4-6 5 7"/></svg>}
              label="Bild"
              onClick={() => document.getElementById("img-upload-hidden")?.click()}
            />
            <SidebarButton
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M17 8h.01"/></svg>}
              label={`Foto-Platzhalter (${placeholderCount}/3)`}
              onClick={addPhotoPlaceholder}
              disabled={placeholderCount >= 3}
            />
            <SidebarButton
              icon={<span className="w-5 h-5 flex items-center justify-center text-lg font-bold">T</span>}
              label="Text"
              onClick={addText}
            />

            <div className="px-3 py-2 border-t border-b border-white/10 mt-1">
              <h3 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Bibliothek</h3>
            </div>

            <SidebarButton
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>}
              label="Elemente"
              onClick={() => setOpenModal("elements")}
            />
            <SidebarButton
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
              label="Vorlagen"
              onClick={() => setOpenModal("templates")}
            />
          </div>

          {/* CANVAS AREA */}
          <div
            ref={wrapperRef}
            className="flex-1 flex items-start justify-center overflow-auto bg-[#1a1b1e] p-4"
          >
            <div ref={canvasWrapRef} className="shadow-2xl shadow-black/50 border border-white/20" style={{ transformOrigin: "top center", backgroundImage: "repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%)", backgroundSize: "16px 16px" }}>
              <canvas ref={canvasRef} />
            </div>
          </div>

          {/* RIGHT SIDEBAR: Layers + Object Properties */}
          <RightPanel
            fabricRef={fabricRef}
            fabricModRef={fabricModRef}
            fonts={fonts}
            fontCategories={fontCategories}
            selectedFont={selectedFont}
            fontSize={fontSize}
            textColor={textColor}
            onFontChange={updateSelectedFont}
            onSizeChange={updateSelectedFontSize}
            onColorChange={updateSelectedColor}
            onUpdate={() => { fabricRef.current?.renderAll(); dirtyRef.current = true; pushHistory(); }}
            onDelete={() => { fabricRef.current?.renderAll(); dirtyRef.current = true; pushHistory(); countPlaceholders(fabricRef.current!); }}
            loadFont={loadFont}
          />
        </div>

        {/* Modals for Elements + Templates */}
        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpenModal(null)}>
            <div className="bg-[#222326] border border-white/10 rounded-xl shadow-2xl w-[600px] max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <h2 className="text-sm font-semibold text-white">{openModal === "elements" ? "Elemente" : "Vorlagen"}</h2>
                <button onClick={() => setOpenModal(null)} className="text-white/40 hover:text-white"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {openModal === "elements" && <ElementsPanel elements={designElements} onSelect={(el) => { addDesignElement(el); setOpenModal(null); }} />}
                {openModal === "templates" && <TemplatesPanel templates={templates} onSelect={(t) => { loadTemplate(t); setOpenModal(null); }} />}
              </div>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="h-14 border-t border-white/10 bg-[#222326] flex items-center justify-between px-6 shrink-0">
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
  title,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        px-2 py-1.5 text-sm rounded-lg border transition-colors
        ${active ? "border-[#F6A11C] text-[#F6A11C]" : "border-white/10 text-white/70 hover:text-white hover:border-white/20"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      {children}
    </button>
  );
}

function PropSection({ title, children, action, collapsible, defaultOpen }: { title: string; children: React.ReactNode; action?: { label: string; onClick: () => void }; collapsible?: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? !collapsible);
  return (
    <div className="space-y-1.5 py-2 border-b border-white/10">
      <div className="flex items-center justify-between">
        <h4
          className={`text-[10px] font-semibold text-white/50 uppercase tracking-wider ${collapsible ? "cursor-pointer select-none hover:text-white/70" : ""}`}
          onClick={collapsible ? () => setOpen(!open) : undefined}
        >
          {collapsible && <span className="inline-block w-3 text-[8px]">{open ? "▾" : "▸"}</span>}
          {title}
        </h4>
        {action && open && (
          <button onClick={action.onClick} className="text-[9px] text-red-400 hover:text-red-300">{action.label}</button>
        )}
      </div>
      {open && children}
    </div>
  );
}

function SidebarButton({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      <span className="text-white/50 shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
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
  fabricRef,
  onCanvasUpdate,
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
  fabricRef: React.RefObject<Canvas | null>;
  onCanvasUpdate: () => void;
}) {
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const filtered = filterCat ? fonts.filter((f) => f.category === filterCat) : fonts;

  // Build the Google Fonts URL only when the actual font families change
  const fontsHref = useMemo(() => {
    if (filtered.length === 0) return "";
    return `https://fonts.googleapis.com/css2?${filtered.map((f) => `family=${encodeURIComponent(f.family)}:wght@400;700`).join("&")}&display=swap`;
  }, [filtered.map((f) => f.family).join(",")]);

  // Load all fonts for current filter via a single <link> in <head>
  useEffect(() => {
    if (!fontsHref) return;
    const id = "gfonts-preview";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== fontsHref) {
      link.href = fontsHref;
    }
  }, [fontsHref]);

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
            max={400}
            value={fontSize}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="flex-1 accent-[#F6A11C]"
          />
          <input
            type="number"
            min={8}
            max={400}
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

      {/* Letter spacing + Line height */}
      <div>
        <label className="text-xs text-white/50 block mb-1">Zeichenabstand</label>
        <input
          type="range"
          min={-200}
          max={1000}
          value={(() => {
            const active = fabricRef.current?.getActiveObject();
            return (active && active.type === "textbox") ? (active as any).charSpacing ?? 0 : 0;
          })()}
          onChange={(e) => {
            const canvas = fabricRef.current;
            if (!canvas) return;
            const active = canvas.getActiveObject();
            if (active && active.type === "textbox") {
              (active as any).set("charSpacing", Number(e.target.value));
              onCanvasUpdate();
            }
          }}
          className="w-full accent-[#F6A11C]"
        />
      </div>

      <div>
        <label className="text-xs text-white/50 block mb-1">Zeilenabstand</label>
        <input
          type="range"
          min={50}
          max={300}
          value={(() => {
            const active = fabricRef.current?.getActiveObject();
            return (active && active.type === "textbox") ? Math.round(((active as any).lineHeight ?? 1.16) * 100) : 116;
          })()}
          onChange={(e) => {
            const canvas = fabricRef.current;
            if (!canvas) return;
            const active = canvas.getActiveObject();
            if (active && active.type === "textbox") {
              (active as any).set("lineHeight", Number(e.target.value) / 100);
              onCanvasUpdate();
            }
          }}
          className="w-full accent-[#F6A11C]"
        />
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
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/80">Bild hochladen</h3>
      <p className="text-xs text-white/40">
        PNG, JPG oder WebP, max. 10 MB. Bild wird maßstabsgetreu eingefügt.
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

// ---------------------------------------------------------------------------
// Right Panel: Layers + Object Properties
// ---------------------------------------------------------------------------

function RightPanel({
  fabricRef,
  fabricModRef,
  fonts,
  fontCategories,
  selectedFont,
  fontSize,
  textColor,
  onFontChange,
  onSizeChange,
  onColorChange,
  onUpdate,
  onDelete,
  loadFont,
}: {
  fabricRef: React.RefObject<Canvas | null>;
  fabricModRef: React.RefObject<typeof import("fabric") | null>;
  fonts: FontDef[];
  fontCategories: { key: string; label: string }[];
  selectedFont: string;
  fontSize: number;
  textColor: string;
  onFontChange: (f: string) => void;
  onSizeChange: (s: number) => void;
  onColorChange: (c: string) => void;
  onUpdate: () => void;
  onDelete: () => void;
  loadFont: (family: string, weight?: number, style?: string) => Promise<void>;
}) {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  const [lockRatio, setLockRatio] = useState(false);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState(15);
  const [shadowOffsetX, setShadowOffsetX] = useState(5);
  const [shadowOffsetY, setShadowOffsetY] = useState(5);

  useEffect(() => {
    const interval = setInterval(refresh, 500);
    return () => clearInterval(interval);
  }, []);

  const canvas = fabricRef.current;
  if (!canvas) return null;

  const objects = canvas.getObjects();
  const activeObj = canvas.getActiveObject();

  // Helper: get stroke color (works for groups by checking first child)
  function getStrokeColor(obj: any): string {
    if (typeof obj.stroke === "string" && obj.stroke) return obj.stroke;
    if (typeof obj.getObjects === "function") {
      const child = obj.getObjects().find((c: any) => typeof c.stroke === "string" && c.stroke);
      if (child) return child.stroke;
    }
    return "#000000";
  }

  function getStrokeWidth(obj: any): number {
    if ((obj.strokeWidth ?? 0) > 0) return Math.round(obj.strokeWidth);
    if (typeof obj.getObjects === "function") {
      const child = obj.getObjects().find((c: any) => (c.strokeWidth ?? 0) > 0);
      if (child) return Math.round(child.strokeWidth);
    }
    return 0;
  }

  // Helper: apply stroke to object (handles groups)
  function applyStroke(obj: any, color: string | undefined, width: number | undefined) {
    if (typeof obj.getObjects === "function") {
      // For placeholder groups, only apply stroke to the rect, not the text label
      const children = obj.isPhotoPlaceholder
        ? obj.getObjects().filter((c: any) => c.text === undefined)
        : obj.getObjects();
      children.forEach((c: any) => {
        if (color !== undefined) c.set("stroke", color);
        if (width !== undefined) c.set("strokeWidth", width);
        c.set("paintFirst", "stroke");
        c.set("dirty", true);
      });
    }
    if (color !== undefined) obj.set("stroke", color);
    if (width !== undefined) obj.set("strokeWidth", width);
    obj.set("paintFirst", "stroke");
    obj.set("dirty", true);
  }

  // Helper: apply shadow to object (handles groups)
  function applyShadow(obj: any, shadow: any) {
    // For placeholder groups, apply shadow only to the rect child, not the label
    if (obj.isPhotoPlaceholder && typeof obj.getObjects === "function") {
      const rect = obj.getObjects().find((c: any) => c.text === undefined);
      if (rect) {
        rect.shadow = shadow;
        rect.dirty = true;
      }
    } else {
      obj.shadow = shadow;
    }
    obj.dirty = true;
    if (typeof obj.getObjects === "function") {
      obj.getObjects().forEach((c: any) => { c.dirty = true; });
    }
  }

  function applyShadowLive(obj: any, color: string, blur: number, offX: number, offY: number) {
    const fabric = fabricModRef.current;
    if (!fabric) return;
    const shadow = new fabric.Shadow({ color, blur, offsetX: offX, offsetY: offY });
    applyShadow(obj, shadow);
  }

  function detectKind(obj: any): "placeholder" | "background" | "text" | "image" | "group" | "rect" | "unknown" {
    if (obj.isPhotoPlaceholder) return "placeholder";
    if (obj.isBackground) return "background";
    if (obj.text !== undefined && obj.fontFamily !== undefined) return "text";
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
      case "text": return `${(obj.text || "").substring(0, 16) || "Text"}`;
      case "image": return obj.isBackground ? "Hintergrund" : "Bild";
      case "group": return "Gruppe";
      case "rect": return "Rechteck";
      default: return `Ebene`;
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

  // Object property helpers
  function getObjProp(prop: string): number {
    if (!activeObj) return 0;
    if (prop === "w") return Math.round((activeObj.width ?? 0) * (activeObj.scaleX ?? 1));
    if (prop === "h") return Math.round((activeObj.height ?? 0) * (activeObj.scaleY ?? 1));
    if (prop === "x") return Math.round(activeObj.left ?? 0);
    if (prop === "y") return Math.round(activeObj.top ?? 0);
    if (prop === "angle") return Math.round(activeObj.angle ?? 0);
    return 0;
  }

  function setObjProp(prop: string, val: number) {
    if (!activeObj) return;
    if (prop === "x") { activeObj.set("left", val); }
    else if (prop === "y") { activeObj.set("top", val); }
    else if (prop === "angle") { activeObj.set("angle", val); }
    else if (prop === "w") {
      const origW = activeObj.width ?? 1;
      const newScaleX = val / origW;
      activeObj.set("scaleX", newScaleX);
      if (lockRatio) {
        activeObj.set("scaleY", newScaleX);
      }
    } else if (prop === "h") {
      const origH = activeObj.height ?? 1;
      const newScaleY = val / origH;
      activeObj.set("scaleY", newScaleY);
      if (lockRatio) {
        activeObj.set("scaleX", newScaleY);
      }
    }
    activeObj.setCoords();
    onUpdate();
    refresh();
  }

  const reversed = [...objects].reverse();
  const lbl = "text-[10px] text-white/40";
  const inp = "w-full rounded bg-[#1a1b1e] border border-white/10 text-white text-[11px] text-center px-1 py-0.5";

  return (
    <div className="w-[220px] shrink-0 border-l border-white/10 bg-[#222326] flex flex-col">
      {/* Layers list */}
      <div className="px-3 py-1.5 border-b border-white/10 shrink-0">
        <h3 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Ebenen</h3>
      </div>
      <div className="max-h-[40%] overflow-y-auto shrink-0 border-b border-white/10">
        {reversed.map((obj: any, revIdx: number) => {
          const isActive = obj === activeObj;
          const isVisible = obj.visible !== false;
          const color = getLayerColor(obj);
          return (
            <div
              key={revIdx}
              className={`flex items-center gap-1.5 px-2 py-1.5 text-[11px] cursor-pointer border-b border-white/5 transition-colors ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              } ${!isVisible ? "opacity-30" : ""}`}
              onClick={() => { canvas.setActiveObject(obj); canvas.renderAll(); refresh(); }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className={`flex-1 truncate ${isActive ? "text-white font-medium" : "text-white/60"}`}>
                {getLayerName(obj)}
              </span>
              <div className="flex items-center gap-px shrink-0">
                <button onClick={(e) => {
                    e.stopPropagation();
                    const locked = !(obj.selectable === false);
                    obj.set("selectable", !locked);
                    obj.set("evented", !locked);
                    obj.set("hasControls", !locked);
                    if (locked) canvas.discardActiveObject();
                    canvas.renderAll(); refresh();
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10" title={obj.selectable === false ? "Entsperren" : "Sperren"}>
                  <svg className={`w-3 h-3 ${obj.selectable === false ? "text-[#F6A11C]" : "text-white/40"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {obj.selectable === false
                      ? <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
                      : <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></>}
                  </svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); obj.set("visible", !isVisible); onUpdate(); refresh(); }}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10" title={isVisible ? "Ausblenden" : "Einblenden"}>
                  <svg className={`w-3 h-3 ${isVisible ? "text-white/40" : "text-white/20"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {isVisible ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></>}
                  </svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); const objs = canvas._objects; const idx = objs.indexOf(obj); if (idx >= 0 && idx < objs.length - 1) { objs.splice(idx, 1); objs.splice(idx + 1, 0, obj); canvas.setActiveObject(obj); canvas.renderAll(); onUpdate(); refresh(); } }}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10" title="Nach oben">
                  <svg className="w-3 h-3 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); const objs = canvas._objects; const idx = objs.indexOf(obj); if (idx > 0) { objs.splice(idx, 1); objs.splice(idx - 1, 0, obj); canvas.setActiveObject(obj); canvas.renderAll(); onUpdate(); refresh(); } }}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10" title="Nach unten">
                  <svg className="w-3 h-3 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); canvas.remove(obj); onDelete(); refresh(); }}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20" title="Löschen">
                  <svg className="w-3 h-3 text-white/30 hover:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          );
        })}
        {objects.length === 0 && <p className="text-[10px] text-white/30 p-3 text-center">Keine Ebenen</p>}
      </div>

      {/* Object Properties */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {activeObj ? (
          <>
            {/* ── TEXT ── */}
            {activeObj.type === "textbox" && (
              <PropSection title="Text">
                <label className={lbl}>Schriftart</label>
                <select
                  value={(activeObj as any).fontFamily ?? selectedFont}
                  onChange={(e) => onFontChange(e.target.value)}
                  className="w-full rounded bg-[#1a1b1e] border border-white/10 text-white text-[11px] px-2 py-1"
                >
                  {fonts.map((f) => <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>{f.family}</option>)}
                </select>

                <div className="flex gap-1">
                  {([
                    { key: "bold", prop: "fontWeight", on: "bold", off: "normal", label: "F", style: "font-bold", weight: 700, fontStyle: "normal" },
                    { key: "italic", prop: "fontStyle", on: "italic", off: "normal", label: "K", style: "italic", weight: 400, fontStyle: "italic" },
                  ] as const).map(({ key, prop, on, off, label, style, weight, fontStyle }) => {
                    const active = (activeObj as any)[prop] === on;
                    return (
                      <button
                        key={key}
                        onClick={async () => {
                          const newVal = active ? off : on;
                          if (newVal !== off) {
                            const family = (activeObj as any).fontFamily ?? selectedFont;
                            const curWeight = key === "bold" ? weight : ((activeObj as any).fontWeight === "bold" ? 700 : 400);
                            const curStyle = key === "italic" ? fontStyle : ((activeObj as any).fontStyle ?? "normal");
                            await loadFont(family, curWeight, curStyle);
                          }
                          (activeObj as any).set(prop, newVal);
                          onUpdate(); refresh();
                        }}
                        className={`flex-1 py-1 rounded text-[10px] font-semibold transition-colors ${style} ${
                          active ? "bg-[#F6A11C] text-black" : "bg-white/5 text-white/50 hover:text-white/70"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      const current = (activeObj as any).text || "";
                      const isUpper = current === current.toUpperCase() && current !== current.toLowerCase();
                      (activeObj as any).set("text", isUpper ? current.toLowerCase() : current.toUpperCase());
                      onUpdate(); refresh();
                    }}
                    className={`flex-1 py-1 rounded text-[10px] font-semibold transition-colors ${
                      (() => { const t = (activeObj as any).text || ""; return t === t.toUpperCase() && t !== t.toLowerCase(); })()
                        ? "bg-[#F6A11C] text-black" : "bg-white/5 text-white/50 hover:text-white/70"
                    }`}
                  >
                    AB
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-1.5 items-end">
                  <div>
                    <label className={lbl}>Größe</label>
                    <div className="flex items-center gap-1.5">
                      <input type="range" min={8} max={400} value={Math.round((activeObj as any).fontSize ?? fontSize)}
                        onChange={(e) => onSizeChange(Number(e.target.value) || 40)}
                        className="flex-1 accent-[#F6A11C] h-1" />
                      <input type="number" min={8} max={400}
                        className="w-14 shrink-0 rounded bg-[#1a1b1e] border border-white/10 text-white text-[11px] text-center px-1 py-0.5"
                        value={Math.round((activeObj as any).fontSize ?? fontSize)}
                        onChange={(e) => onSizeChange(Number(e.target.value) || 40)} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Farbe</label>
                    <input type="color" value={(activeObj as any).fill ?? textColor}
                      onChange={(e) => onColorChange(e.target.value)}
                      className="w-8 h-7 rounded cursor-pointer border border-white/10 bg-transparent" />
                  </div>
                </div>

                <label className={lbl}>Ausrichtung</label>
                <div className="flex gap-1">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => { (activeObj as any).set("textAlign", align); onUpdate(); refresh(); }}
                      className={`flex-1 py-1 rounded text-[10px] font-semibold transition-colors ${
                        (activeObj as any).textAlign === align
                          ? "bg-[#F6A11C] text-black"
                          : "bg-white/5 text-white/50 hover:text-white/70"
                      }`}
                    >
                      {align === "left" ? "Links" : align === "center" ? "Mitte" : "Rechts"}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <label className={lbl}>Zeichenabstand</label>
                  {((activeObj as any).charSpacing ?? 0) !== 0 && (
                    <button onClick={() => { (activeObj as any).set("charSpacing", 0); onUpdate(); refresh(); }}
                      className="text-[9px] text-white/40 hover:text-white">Reset</button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <input type="range" min={-200} max={1000} value={(activeObj as any).charSpacing ?? 0}
                    onChange={(e) => { (activeObj as any).set("charSpacing", Number(e.target.value)); onUpdate(); refresh(); }}
                    className="flex-1 accent-[#F6A11C] h-1" />
                  <input type="number" min={-200} max={1000} className={`${inp} w-14`}
                    value={(activeObj as any).charSpacing ?? 0}
                    onChange={(e) => { (activeObj as any).set("charSpacing", Number(e.target.value)); onUpdate(); refresh(); }} />
                </div>

                <div className="flex items-center justify-between">
                  <label className={lbl}>Zeilenabstand</label>
                  {Math.round(((activeObj as any).lineHeight ?? 1.16) * 100) !== 116 && (
                    <button onClick={() => { (activeObj as any).set("lineHeight", 1.16); onUpdate(); refresh(); }}
                      className="text-[9px] text-white/40 hover:text-white">Reset</button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <input type="range" min={50} max={300} value={Math.round(((activeObj as any).lineHeight ?? 1.16) * 100)}
                    onChange={(e) => { (activeObj as any).set("lineHeight", Number(e.target.value) / 100); onUpdate(); refresh(); }}
                    className="flex-1 accent-[#F6A11C] h-1" />
                  <div className="flex items-center gap-0.5">
                    <input type="number" min={50} max={300} className={`${inp} w-12`}
                      value={Math.round(((activeObj as any).lineHeight ?? 1.16) * 100)}
                      onChange={(e) => { (activeObj as any).set("lineHeight", Number(e.target.value) / 100); onUpdate(); refresh(); }} />
                    <span className="text-[9px] text-white/30">%</span>
                  </div>
                </div>
              </PropSection>
            )}

            {/* ── POSITION ── */}
            <PropSection title="Position">
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className={lbl}>X</label>
                  <input type="number" className={inp} value={getObjProp("x")}
                    onChange={(e) => setObjProp("x", Number(e.target.value) || 0)} />
                </div>
                <div>
                  <label className={lbl}>Y</label>
                  <input type="number" className={inp} value={getObjProp("y")}
                    onChange={(e) => setObjProp("y", Number(e.target.value) || 0)} />
                </div>
              </div>
            </PropSection>

            {/* ── GRÖSSE ── */}
            <PropSection title="Größe">
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className={lbl}>Breite</label>
                  <input type="number" className={inp} value={getObjProp("w")}
                    onChange={(e) => setObjProp("w", Number(e.target.value) || 1)} />
                </div>
                <div>
                  <label className={lbl}>Höhe</label>
                  <input type="number" className={inp} value={getObjProp("h")}
                    onChange={(e) => setObjProp("h", Number(e.target.value) || 1)} />
                </div>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer mt-1">
                <input type="checkbox" checked={lockRatio} onChange={() => setLockRatio(!lockRatio)}
                  className="accent-[#F6A11C] w-3 h-3" />
                <span className="text-[10px] text-white/50">Seitenverhältnis beibehalten</span>
              </label>
            </PropSection>

            {/* ── TRANSFORMATION ── */}
            <PropSection title="Transformation">
              <label className={lbl}>Drehung</label>
              <div className="flex items-center gap-1.5">
                <input type="range" min={0} max={360} value={getObjProp("angle")}
                  onChange={(e) => setObjProp("angle", Number(e.target.value))} className="flex-1 accent-[#F6A11C] h-1" />
                <input type="number" className={`${inp} w-12`} value={getObjProp("angle")}
                  onChange={(e) => setObjProp("angle", Number(e.target.value) || 0)} />
                <span className="text-[10px] text-white/30">°</span>
              </div>

              <label className={lbl}>Deckkraft</label>
              <div className="flex items-center gap-1.5">
                <input type="range" min={0} max={100} value={Math.round((activeObj.opacity ?? 1) * 100)}
                  onChange={(e) => { activeObj.set("opacity", Number(e.target.value) / 100); onUpdate(); refresh(); }}
                  className="flex-1 accent-[#F6A11C] h-1" />
                <input type="number" min={0} max={100} className={`${inp} w-12`}
                  value={Math.round((activeObj.opacity ?? 1) * 100)}
                  onChange={(e) => { activeObj.set("opacity", Math.min(100, Math.max(0, Number(e.target.value) || 0)) / 100); onUpdate(); refresh(); }} />
                <span className="text-[10px] text-white/30">%</span>
              </div>
            </PropSection>

            {/* ── RAHMEN ── */}
            <PropSection title="Rahmen" collapsible>
              <label className={lbl}>Farbe</label>
              <input type="color" value={getStrokeColor(activeObj)}
                onChange={(e) => {
                  applyStroke(activeObj, e.target.value, undefined);
                  if (!((activeObj as any).strokeWidth > 0)) applyStroke(activeObj, e.target.value, 2);
                  canvas.renderAll(); onUpdate(); refresh();
                }}
                className="w-full h-6 rounded cursor-pointer border border-white/10 bg-transparent" />

              <label className={lbl}>Stärke: {getStrokeWidth(activeObj)}px</label>
              <input type="range" min={0} max={30} value={getStrokeWidth(activeObj)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  applyStroke(activeObj, val > 0 ? (getStrokeColor(activeObj) || "#000000") : getStrokeColor(activeObj), val);
                  canvas.renderAll(); onUpdate(); refresh();
                }}
                className="w-full accent-[#F6A11C] h-1" />
            </PropSection>

            {/* ── SCHATTEN ── */}
            <PropSection title="Schatten" collapsible action={(() => {
              // For placeholders, check shadow on rect child
              if ((activeObj as any).isPhotoPlaceholder && typeof (activeObj as any).getObjects === "function") {
                const rect = (activeObj as any).getObjects().find((c: any) => c.text === undefined);
                return rect?.shadow;
              }
              return (activeObj as any).shadow;
            })() ? {
              label: "Entfernen", onClick: () => {
                applyShadow(activeObj, null);
                canvas.renderAll(); onUpdate(); refresh();
              }
            } : undefined}>
              <label className={lbl}>Farbe</label>
              <input type="color" value={shadowColor}
                onChange={(e) => {
                  setShadowColor(e.target.value);
                  applyShadowLive(activeObj, e.target.value, shadowBlur, shadowOffsetX, shadowOffsetY);
                  canvas.renderAll(); onUpdate(); refresh();
                }}
                className="w-full h-6 rounded cursor-pointer border border-white/10 bg-transparent" />

              <label className={lbl}>Weichheit: {shadowBlur}px</label>
              <input type="range" min={0} max={50} value={shadowBlur}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setShadowBlur(v);
                  applyShadowLive(activeObj, shadowColor, v, shadowOffsetX, shadowOffsetY);
                  canvas.renderAll(); onUpdate(); refresh();
                }}
                className="w-full accent-[#F6A11C] h-1" />

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className={lbl}>Abstand X: {shadowOffsetX}</label>
                  <input type="range" min={-30} max={30} value={shadowOffsetX}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setShadowOffsetX(v);
                      applyShadowLive(activeObj, shadowColor, shadowBlur, v, shadowOffsetY);
                      canvas.renderAll(); onUpdate(); refresh();
                    }} className="w-full accent-[#F6A11C] h-1" />
                </div>
                <div>
                  <label className={lbl}>Abstand Y: {shadowOffsetY}</label>
                  <input type="range" min={-30} max={30} value={shadowOffsetY}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setShadowOffsetY(v);
                      applyShadowLive(activeObj, shadowColor, shadowBlur, shadowOffsetX, v);
                      canvas.renderAll(); onUpdate(); refresh();
                    }} className="w-full accent-[#F6A11C] h-1" />
                </div>
              </div>
            </PropSection>
          </>
        ) : (
          <p className="text-[10px] text-white/30 text-center mt-4">Wähle ein Element aus</p>
        )}
      </div>
    </div>
  );
}
