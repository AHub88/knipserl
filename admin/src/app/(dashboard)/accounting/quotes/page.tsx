import { prisma } from "@/lib/db";
import { IconFileInvoice, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { QuotesTable } from "./quotes-table";

export default async function QuotesPage() {
  let quotes;
  try {
    quotes = await prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } },
        order: { select: { customerName: true, orderNumber: true } },
      },
    });
  } catch (e) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="text-red-400 font-medium">Datenbankfehler beim Laden der Angebote</p>
        <p className="text-xs text-red-400/70 mt-2 break-all">{e instanceof Error ? e.message : String(e)}</p>
      </div>
    );
  }

  const serialized = quotes.map((quote) => ({
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    customerName: quote.order?.customerName ?? quote.recipientName ?? "–",
    companyName: quote.company.name,
    totalAmount: quote.totalAmount,
    status: quote.status,
    createdAt: quote.createdAt.toISOString(),
    validUntil: quote.validUntil.toISOString(),
  }));

  const totalCount = quotes.length;
  const draftCount = quotes.filter((q) => q.status === "DRAFT").length;
  const sentCount = quotes.filter((q) => q.status === "SENT").length;
  const acceptedCount = quotes.filter((q) => q.status === "ACCEPTED").length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
            <IconFileInvoice className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Angebote
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalCount} Angebote insgesamt
            </p>
          </div>
        </div>
        <Link
          href="/accounting/quotes/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#F6A11C] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#F6A11C]/90"
        >
          <IconPlus className="size-4" />
          Neues Angebot
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/[0.10] bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Gesamt
          </p>
          <p className="text-2xl font-bold text-zinc-100 tabular-nums">
            {totalCount}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.10] bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Entwurf
          </p>
          <p className="text-2xl font-bold text-zinc-400 tabular-nums">
            {draftCount}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.10] bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Versendet
          </p>
          <p className="text-2xl font-bold text-blue-400 tabular-nums">
            {sentCount}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.10] bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Angenommen
          </p>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">
            {acceptedCount}
          </p>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-white/[0.10] bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.10]">
          <h2 className="text-sm font-semibold text-zinc-300">
            Alle Angebote
          </h2>
        </div>
        {quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <IconFileInvoice className="size-10 mb-3 text-zinc-400" />
            <p className="text-sm">Noch keine Angebote vorhanden</p>
          </div>
        ) : (
          <QuotesTable quotes={serialized} />
        )}
      </div>
    </div>
  );
}
