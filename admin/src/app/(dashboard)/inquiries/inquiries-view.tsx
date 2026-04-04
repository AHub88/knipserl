"use client";

import { useState } from "react";
import { IconList, IconLayoutKanban } from "@tabler/icons-react";
import { InquiriesTable } from "./inquiries-table-body";
import { InquiriesKanban } from "./inquiries-kanban";

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

type View = "list" | "kanban";

export function InquiriesView({ inquiries }: { inquiries: SerializedInquiry[] }) {
  const [view, setView] = useState<View>("kanban");

  return (
    <div className="space-y-3">
      {/* View toggle */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setView("kanban")}
          className={
            "flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors " +
            (view === "kanban"
              ? "border-[#F6A11C]/40 bg-[#F6A11C]/10 text-[#F6A11C]"
              : "border-white/[0.08] bg-card text-zinc-400 hover:text-zinc-200")
          }
        >
          <IconLayoutKanban className="size-3.5" />
          Kanban
        </button>
        <button
          onClick={() => setView("list")}
          className={
            "flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors " +
            (view === "list"
              ? "border-[#F6A11C]/40 bg-[#F6A11C]/10 text-[#F6A11C]"
              : "border-white/[0.08] bg-card text-zinc-400 hover:text-zinc-200")
          }
        >
          <IconList className="size-3.5" />
          Liste
        </button>
      </div>

      {/* Content */}
      {view === "kanban" ? (
        <InquiriesKanban inquiries={inquiries} />
      ) : (
        <InquiriesTable inquiries={inquiries} />
      )}
    </div>
  );
}
