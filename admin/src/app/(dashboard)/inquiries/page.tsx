import { prisma } from "@/lib/db";
import {
  IconInbox,
  IconMapPin,
  IconCalendarEvent,
  IconPlus,
  IconMail,
} from "@tabler/icons-react";
import Link from "next/link";
import { InquiriesView } from "./inquiries-view";

export default async function InquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: { select: { id: true } } },
  });

  const countByStatus = {
    total: inquiries.length,
    new: inquiries.filter((i) => i.status === "NEW").length,
    accepted: inquiries.filter((i) => i.status === "ACCEPTED").length,
    rejected: inquiries.filter((i) => i.status === "REJECTED").length,
  };

  // Serialize dates for the client component
  const serializedInquiries = inquiries.map((inquiry) => ({
    id: inquiry.id,
    customerName: inquiry.customerName,
    customerEmail: inquiry.customerEmail,
    customerType: inquiry.customerType,
    eventType: inquiry.eventType,
    eventDate: inquiry.eventDate.toISOString(),
    locationName: inquiry.locationName,
    distanceKm: inquiry.distanceKm,
    status: inquiry.status,
    createdAt: inquiry.createdAt.toISOString(),
    hasOrder: !!inquiry.order,
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C] shrink-0">
            <IconMail className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Anfragen
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {countByStatus.total} insgesamt
            </p>
          </div>
        </div>
        <Link
          href="/inquiries/new"
          className="flex items-center gap-2 h-9 px-3 sm:px-4 rounded-lg bg-[#F6A11C] text-black text-sm font-semibold hover:bg-[#F6A11C]/90 transition-colors"
        >
          <IconPlus className="size-4" />
          <span className="hidden sm:inline">Neue Anfrage</span>
        </Link>
      </div>

      {/* Stats cards - compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.10] bg-card px-3 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F6A11C]/15">
            <IconInbox className="size-4 text-[#F6A11C]" />
          </div>
          <div>
            <p className="text-xl font-bold text-zinc-100">{countByStatus.total}</p>
            <p className="text-[11px] text-zinc-400">Gesamt</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.10] bg-card px-3 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
            <IconCalendarEvent className="size-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-zinc-100">{countByStatus.new}</p>
            <p className="text-[11px] text-zinc-400">Neu</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.10] bg-card px-3 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
            <IconMapPin className="size-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-zinc-100">{countByStatus.accepted}</p>
            <p className="text-[11px] text-zinc-400">Angenommen</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.10] bg-card px-3 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
            <IconInbox className="size-4 text-red-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-zinc-100">{countByStatus.rejected}</p>
            <p className="text-[11px] text-zinc-400">Abgelehnt</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-white/[0.10] bg-card flex flex-col items-center justify-center py-16 text-muted-foreground">
          <IconInbox className="size-10 mb-3 text-zinc-400" />
          <p className="text-sm font-medium">Noch keine Anfragen</p>
          <p className="text-xs text-muted-foreground mt-1">
            Neue Anfragen erscheinen hier automatisch.
          </p>
        </div>
      ) : (
        <InquiriesView inquiries={serializedInquiries} />
      )}
    </div>
  );
}
