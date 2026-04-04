"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconMapPin, IconGripVertical } from "@tabler/icons-react";

interface SerializedInquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  customerType: string;
  eventType: string;
  eventDate: string;
  locationName: string;
  distanceKm: number | null;
  status: string;
  createdAt: string;
  hasOrder: boolean;
}

const COLUMNS = [
  { key: "NEW", label: "Offen", color: "amber" },
  { key: "CONTACTED", label: "Kontaktiert", color: "blue" },
  { key: "WAITING", label: "Warte auf Zusage", color: "purple" },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

const columnColors: Record<string, { dot: string; border: string; bg: string; text: string; headerBg: string }> = {
  amber: { dot: "bg-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-400", headerBg: "bg-amber-500/10" },
  blue: { dot: "bg-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-400", headerBg: "bg-blue-500/10" },
  purple: { dot: "bg-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5", text: "text-purple-400", headerBg: "bg-purple-500/10" },
  emerald: { dot: "bg-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5", text: "text-emerald-400", headerBg: "bg-emerald-500/10" },
};

async function updateStatus(id: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateStatus", status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function InquiryCard({
  inquiry,
  onDragStart,
  onClick,
  mobileSelected,
}: {
  inquiry: SerializedInquiry;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: () => void;
  mobileSelected: boolean;
}) {
  const d = new Date(inquiry.eventDate);
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, inquiry.id)}
      onClick={onClick}
      className={
        "rounded-lg border bg-card p-3 cursor-pointer transition-all hover:border-white/[0.15] active:scale-[0.98] " +
        (mobileSelected
          ? "border-[#F6A11C]/40 ring-1 ring-[#F6A11C]/25"
          : "border-white/[0.08]")
      }
    >
      <div className="flex items-start gap-2">
        <IconGripVertical className="size-3.5 text-zinc-600 mt-0.5 shrink-0 hidden sm:block" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-200 truncate">{inquiry.customerName}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] tabular-nums text-zinc-500">
              {d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}
            </span>
            <span className="text-[10px] text-zinc-600">&middot;</span>
            <span className="text-[11px] text-zinc-500 truncate">{inquiry.eventType}</span>
          </div>
          {inquiry.locationName && (
            <div className="flex items-center gap-1 mt-1">
              <IconMapPin className="size-3 text-zinc-600 shrink-0" />
              <span className="text-[11px] text-zinc-500 truncate">{inquiry.locationName}</span>
              {inquiry.distanceKm != null && (
                <span className="text-[10px] text-zinc-600 shrink-0">{inquiry.distanceKm.toFixed(0)} km</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InquiriesKanban({ inquiries }: { inquiries: SerializedInquiry[] }) {
  const router = useRouter();
  const [items, setItems] = useState(inquiries);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  // Mobile: tap card then tap column to move
  const [mobileSelected, setMobileSelected] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, id: string) {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, columnKey: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(columnKey);
  }

  function handleDragLeave() {
    setDragOver(null);
  }

  async function handleDrop(e: React.DragEvent, targetStatus: string) {
    e.preventDefault();
    setDragOver(null);
    if (!dragId) return;
    await moveCard(dragId, targetStatus);
    setDragId(null);
  }

  async function handleMobileMove(targetStatus: string) {
    if (!mobileSelected) return;
    await moveCard(mobileSelected, targetStatus);
    setMobileSelected(null);
  }

  async function moveCard(id: string, targetStatus: string) {
    const item = items.find((i) => i.id === id);
    if (!item || item.status === targetStatus) return;

    // Optimistic update
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: targetStatus } : i)));

    const ok = await updateStatus(id, targetStatus);
    if (!ok) {
      // Revert
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: item.status } : i)));
      toast.error("Status konnte nicht geändert werden");
    } else {
      toast.success(`Status → ${COLUMNS.find((c) => c.key === targetStatus)?.label}`);
    }
  }

  function handleCardClick(inquiry: SerializedInquiry) {
    // On mobile: first tap selects, second tap (or tap on column header) moves
    // On desktop: navigate to detail
    if (window.innerWidth < 768) {
      if (mobileSelected === inquiry.id) {
        // Second tap → navigate
        router.push(`/inquiries/${inquiry.id}`);
      } else {
        setMobileSelected(inquiry.id);
      }
    } else {
      router.push(`/inquiries/${inquiry.id}`);
    }
  }

  // Filter out ACCEPTED and REJECTED from kanban (they become orders / are done)
  const activeItems = items.filter((i) => i.status !== "REJECTED" && i.status !== "ACCEPTED");

  return (
    <div>
      {/* Mobile: show selected card hint */}
      {mobileSelected && (
        <div className="md:hidden mb-3 rounded-lg bg-[#F6A11C]/10 border border-[#F6A11C]/20 px-3 py-2 text-xs text-[#F6A11C]">
          Tippe auf eine Spalte um die Karte zu verschieben. Nochmal tippen zum Öffnen.
        </div>
      )}

      {/* Kanban columns - horizontal scroll on mobile */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:overflow-visible">
        {COLUMNS.map((col) => {
          const colors = columnColors[col.color];
          const columnItems = activeItems.filter((i) => i.status === col.key);
          const isDragTarget = dragOver === col.key;

          return (
            <div
              key={col.key}
              className={
                "rounded-xl border transition-colors " +
                (isDragTarget
                  ? `${colors.border} ${colors.bg}`
                  : "border-white/[0.06] bg-white/[0.01]")
              }
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              {/* Column header */}
              <button
                className={
                  "w-full flex items-center gap-2 px-3 py-2.5 rounded-t-xl transition-colors " +
                  (mobileSelected ? "md:cursor-default cursor-pointer active:bg-white/[0.03]" : "cursor-default")
                }
                onClick={() => mobileSelected && handleMobileMove(col.key)}
              >
                <span className={"size-2 rounded-full shrink-0 " + colors.dot} />
                <span className={"text-xs font-semibold " + colors.text}>{col.label}</span>
                <span className="text-[11px] text-zinc-600 tabular-nums ml-auto">
                  {columnItems.length}
                </span>
              </button>

              {/* Cards */}
              <div className="p-2 pt-0 space-y-2 min-h-[100px]">
                {columnItems.length === 0 && (
                  <div className="flex items-center justify-center h-[80px] text-xs text-zinc-600 border border-dashed border-white/[0.06] rounded-lg">
                    Keine Anfragen
                  </div>
                )}
                {columnItems.map((inquiry) => (
                  <InquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                    onDragStart={handleDragStart}
                    onClick={() => handleCardClick(inquiry)}
                    mobileSelected={mobileSelected === inquiry.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
