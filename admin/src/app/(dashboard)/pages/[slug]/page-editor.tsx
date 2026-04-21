"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconPlus,
  IconX,
  IconGripVertical,
  IconMinus,
  IconTrash,
  IconDeviceFloppy,
  IconSearch,
  IconPhoto,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PickerAsset = {
  id: string;
  alt: string;
  active: boolean;
  originalFilename: string;
  thumbUrl: string;
};

type Slot = {
  key: string;
  label: string;
  description: string | null;
  aspectRatio: string | null;
  altOverride: string;
  assetId: string | null;
  assetThumb: string | null;
  assetAlt: string;
};

const inputClass =
  "h-9 w-full rounded-lg border border-white/[0.08] bg-[#1c1d20] px-3 text-sm text-zinc-200 outline-none focus:border-[#F6A11C]/50 focus:ring-1 focus:ring-[#F6A11C]/25 transition-colors";

function SortableImpressionCard({
  asset,
  idx,
  onRemove,
}: {
  asset: PickerAsset;
  idx: number;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: asset.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#F6A11C]/40"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset.thumbUrl} alt={asset.alt} className="w-full h-full object-cover" draggable={false} />
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/70 text-zinc-300 hover:text-white cursor-grab active:cursor-grabbing touch-none"
        aria-label="Ziehen"
      >
        <IconGripVertical className="size-3.5" />
      </button>
      <div className="absolute top-1.5 left-10 px-1.5 py-0.5 rounded-md bg-black/70 text-[10px] text-zinc-300 pointer-events-none">
        #{idx + 1}
      </div>
      <button
        type="button"
        onClick={() => onRemove(asset.id)}
        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-zinc-300 hover:text-red-400"
        title="Entfernen"
      >
        <IconMinus className="size-3.5" />
      </button>
    </div>
  );
}

function MediaPicker({
  open,
  assets,
  excludeIds = [],
  onPick,
  onClose,
}: {
  open: boolean;
  assets: PickerAsset[];
  excludeIds?: string[];
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const available = assets.filter((a) => !excludeIds.includes(a.id));
    if (!query.trim()) return available;
    const q = query.trim().toLowerCase();
    return available.filter(
      (a) =>
        a.alt.toLowerCase().includes(q) || a.originalFilename.toLowerCase().includes(q)
    );
  }, [assets, excludeIds, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1100px] max-h-[90vh] rounded-2xl bg-[#1a1b1e] border border-white/[0.10] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
          <h2 className="text-base font-semibold text-zinc-100">Bild aus Medienbibliothek wählen</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06]">
            <IconX className="size-4" />
          </button>
        </div>
        <div className="p-4 border-b border-white/[0.08]">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            <input
              className={inputClass + " pl-8"}
              placeholder="Nach Alt-Text oder Dateiname suchen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              {assets.length === 0
                ? "Medienbibliothek ist noch leer."
                : "Keine Treffer."}
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    onPick(a.id);
                    onClose();
                  }}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden border border-white/[0.08] hover:border-[#F6A11C]/60 transition-colors group ${
                    !a.active ? "opacity-50" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.thumbUrl} alt={a.alt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F6A11C] text-black text-xs font-semibold">
                      <IconPlus className="size-3.5" />
                      Auswählen
                    </span>
                  </div>
                  {a.alt && (
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/70 text-[10px] text-zinc-200 truncate">
                      {a.alt}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PageEditor({
  pageSlug,
  slots: initialSlots,
  hasImpressionSection,
  initialImpressionIds,
  allAssets,
}: {
  pageSlug: string;
  slots: Slot[];
  hasImpressionSection: boolean;
  initialImpressionIds: string[];
  allAssets: PickerAsset[];
}) {
  const router = useRouter();
  const [slots, setSlots] = useState(initialSlots);
  const [impressionIds, setImpressionIds] = useState<string[]>(initialImpressionIds);
  const [impressionsDirty, setImpressionsDirty] = useState(false);
  const [savingImpressions, setSavingImpressions] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<
    { kind: "slot"; slotKey: string } | { kind: "impression" } | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const assetMap = useMemo(() => {
    const m = new Map<string, PickerAsset>();
    for (const a of allAssets) m.set(a.id, a);
    return m;
  }, [allAssets]);

  const impressionAssets = useMemo(
    () => impressionIds.map((id) => assetMap.get(id)).filter(Boolean) as PickerAsset[],
    [impressionIds, assetMap]
  );

  async function saveSlot(slotKey: string, mediaAssetId: string | null, altOverride: string) {
    const res = await fetch(`/api/pages/${pageSlug}/slots/${slotKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaAssetId, altOverride }),
    });
    if (!res.ok) throw new Error("Speichern fehlgeschlagen");
  }

  async function handlePickSlot(slotKey: string, mediaAssetId: string) {
    const asset = assetMap.get(mediaAssetId);
    if (!asset) return;
    setSlots((prev) =>
      prev.map((s) =>
        s.key === slotKey
          ? { ...s, assetId: asset.id, assetThumb: asset.thumbUrl, assetAlt: asset.alt }
          : s
      )
    );
    try {
      const slot = slots.find((s) => s.key === slotKey);
      await saveSlot(slotKey, mediaAssetId, slot?.altOverride ?? "");
      toast.success("Bild zugeordnet");
      router.refresh();
    } catch {
      toast.error("Speichern fehlgeschlagen");
    }
  }

  async function handleClearSlot(slotKey: string) {
    setSlots((prev) =>
      prev.map((s) => (s.key === slotKey ? { ...s, assetId: null, assetThumb: null, assetAlt: "" } : s))
    );
    try {
      await saveSlot(slotKey, null, "");
      toast.success("Zurück auf Fallback");
      router.refresh();
    } catch {
      toast.error("Fehler");
    }
  }

  async function handleAltOverride(slotKey: string, altOverride: string) {
    const slot = slots.find((s) => s.key === slotKey);
    if (!slot) return;
    try {
      await saveSlot(slotKey, slot.assetId, altOverride);
    } catch {
      toast.error("Alt-Text konnte nicht gespeichert werden");
    }
  }

  function handleImpressionAdd(id: string) {
    setImpressionIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setImpressionsDirty(true);
  }

  function handleImpressionRemove(id: string) {
    setImpressionIds((prev) => prev.filter((x) => x !== id));
    setImpressionsDirty(true);
  }

  function handleImpressionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = impressionIds.indexOf(active.id as string);
    const newIdx = impressionIds.indexOf(over.id as string);
    if (oldIdx === -1 || newIdx === -1) return;
    setImpressionIds(arrayMove(impressionIds, oldIdx, newIdx));
    setImpressionsDirty(true);
  }

  async function saveImpressions() {
    setSavingImpressions(true);
    try {
      const res = await fetch(`/api/pages/${pageSlug}/impressions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: impressionIds }),
      });
      if (!res.ok) throw new Error();
      setImpressionsDirty(false);
      toast.success("Impressionen gespeichert");
      router.refresh();
    } catch {
      toast.error("Speichern fehlgeschlagen");
    } finally {
      setSavingImpressions(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Bild-Slots */}
      {slots.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
            Bilder auf der Seite
          </h2>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <div key={slot.key} className="rounded-xl border border-white/[0.10] bg-card p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100">{slot.label}</h3>
                    {slot.description && (
                      <p className="text-[11px] text-zinc-500">{slot.description}</p>
                    )}
                  </div>
                  <code className="text-[10px] text-zinc-600">{slot.key}</code>
                </div>

                <div
                  className="relative rounded-lg bg-black/40 border border-white/[0.06] overflow-hidden"
                  style={{ aspectRatio: slot.aspectRatio ?? "16/9" }}
                >
                  {slot.assetThumb ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slot.assetThumb} alt={slot.assetAlt} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleClearSlot(slot.key)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-zinc-300 hover:text-red-400"
                        title="Zurück auf Fallback"
                      >
                        <IconTrash className="size-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 text-xs gap-1">
                      <IconPhoto className="size-6" />
                      <span>Fallback aus Code</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setPickerTarget({ kind: "slot", slotKey: slot.key })}
                  className="w-full h-8 rounded-md bg-white/[0.06] text-xs text-zinc-300 hover:bg-white/[0.10] transition-colors"
                >
                  {slot.assetThumb ? "Bild austauschen" : "Bild wählen"}
                </button>

                <input
                  className={inputClass + " text-xs"}
                  value={slot.altOverride}
                  placeholder={slot.assetAlt ? `Alt-Override (Standard: "${slot.assetAlt}")` : "Alt-Override"}
                  onChange={(e) =>
                    setSlots((prev) =>
                      prev.map((s) => (s.key === slot.key ? { ...s, altOverride: e.target.value } : s))
                    )
                  }
                  onBlur={(e) => handleAltOverride(slot.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Impressionen-Sektion */}
      {hasImpressionSection && (
        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                Impressionen-Sektion
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Bilder aus der Medienbibliothek für die Galerie auf dieser Seite.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">
                {impressionIds.length} Bild{impressionIds.length === 1 ? "" : "er"}
                {impressionsDirty && <span className="ml-1.5 text-[#F6A11C]">· ungespeichert</span>}
              </span>
              <button
                onClick={saveImpressions}
                disabled={!impressionsDirty || savingImpressions}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F6A11C] text-black text-xs font-semibold hover:bg-[#F6A11C]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <IconDeviceFloppy className="size-3.5" />
                {savingImpressions ? "Speichere..." : "Speichern"}
              </button>
            </div>
          </div>

          {impressionAssets.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleImpressionDragEnd}>
              <SortableContext items={impressionIds} strategy={rectSortingStrategy}>
                <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {impressionAssets.map((a, idx) => (
                    <SortableImpressionCard key={a.id} asset={a} idx={idx} onRemove={handleImpressionRemove} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="rounded-xl border border-dashed border-white/[0.10] bg-card/50 p-6 text-center">
              <p className="text-sm text-zinc-500">Noch keine Bilder in der Impressionen-Sektion.</p>
            </div>
          )}

          <button
            onClick={() => setPickerTarget({ kind: "impression" })}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-white/[0.10] bg-card text-sm text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors"
          >
            <IconPlus className="size-4" />
            Bild aus Medienbibliothek hinzufügen
          </button>
        </section>
      )}

      <MediaPicker
        open={pickerTarget !== null}
        assets={allAssets}
        excludeIds={pickerTarget?.kind === "impression" ? impressionIds : []}
        onPick={(id) => {
          if (!pickerTarget) return;
          if (pickerTarget.kind === "slot") {
            void handlePickSlot(pickerTarget.slotKey, id);
          } else {
            handleImpressionAdd(id);
          }
        }}
        onClose={() => setPickerTarget(null)}
      />
    </div>
  );
}
