"use client";

import { useMemo, useState } from "react";
import { IconPlus, IconMinus, IconGripVertical, IconDeviceFloppy } from "@tabler/icons-react";
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

type Photo = {
  id: string;
  alt: string;
  active: boolean;
  thumbUrl: string;
};

function SelectedCard({
  photo,
  idx,
  onRemove,
}: {
  photo: Photo;
  idx: number;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
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
      className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#F6A11C]/40 group"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.thumbUrl} alt={photo.alt} className="w-full h-full object-cover" draggable={false} />
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
        onClick={() => onRemove(photo.id)}
        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-zinc-300 hover:text-red-400"
        title="Entfernen"
      >
        <IconMinus className="size-3.5" />
      </button>
    </div>
  );
}

export function CollectionEditor({
  slug,
  allPhotos,
  initialSelectedIds,
}: {
  slug: string;
  allPhotos: Photo[];
  initialSelectedIds: string[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const photoMap = useMemo(() => {
    const m = new Map<string, Photo>();
    for (const p of allPhotos) m.set(p.id, p);
    return m;
  }, [allPhotos]);

  const selectedPhotos = useMemo(
    () => selectedIds.map((id) => photoMap.get(id)).filter(Boolean) as Photo[],
    [selectedIds, photoMap]
  );

  const availablePhotos = useMemo(
    () => allPhotos.filter((p) => !selectedIds.includes(p.id)),
    [allPhotos, selectedIds]
  );

  function add(id: string) {
    if (selectedIds.includes(id)) return;
    setSelectedIds([...selectedIds, id]);
    setDirty(true);
  }

  function remove(id: string) {
    setSelectedIds(selectedIds.filter((s) => s !== id));
    setDirty(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = selectedIds.indexOf(active.id as string);
    const newIdx = selectedIds.indexOf(over.id as string);
    if (oldIdx === -1 || newIdx === -1) return;
    setSelectedIds(arrayMove(selectedIds, oldIdx, newIdx));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/impressions/collections/${slug}/photos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      toast.success("Gespeichert");
    } catch {
      toast.error("Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Save bar */}
      <div className="sticky top-14 z-10 rounded-xl border border-white/[0.10] bg-card/95 backdrop-blur p-3 flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-400">
          <span className="text-zinc-200 font-semibold">{selectedIds.length}</span> Bild
          {selectedIds.length === 1 ? "" : "er"} zugeordnet
          {dirty && <span className="ml-2 text-[#F6A11C]">· ungespeichert</span>}
        </div>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <IconDeviceFloppy className="size-4" />
          {saving ? "Speichere..." : "Speichern"}
        </button>
      </div>

      {/* Selected (sortable) */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">
          Zugeordnete Bilder (Reihenfolge per Drag & Drop)
        </h2>
        {selectedPhotos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.10] bg-card/50 p-8 text-center">
            <p className="text-sm text-zinc-500">
              Noch keine Bilder in dieser Collection. Füge unten welche hinzu.
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={selectedIds} strategy={rectSortingStrategy}>
              <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {selectedPhotos.map((p, idx) => (
                  <SelectedCard key={p.id} photo={p} idx={idx} onRemove={remove} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Available */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">
          Alle Bilder · klicken zum Hinzufügen
        </h2>
        {availablePhotos.length === 0 ? (
          <div className="rounded-xl border border-white/[0.10] bg-card p-8 text-center">
            <p className="text-sm text-zinc-500">Alle Bilder sind bereits zugeordnet.</p>
          </div>
        ) : (
          <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {availablePhotos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => add(p.id)}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden border border-white/[0.08] hover:border-[#F6A11C]/50 transition-colors group ${
                  !p.active ? "opacity-50" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbUrl} alt={p.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F6A11C] text-black text-xs font-semibold">
                    <IconPlus className="size-3.5" />
                    Hinzufügen
                  </span>
                </div>
                {!p.active && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-zinc-400">
                    inaktiv
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
