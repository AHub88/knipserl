import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { IconFileInvoice } from "@tabler/icons-react";
import Link from "next/link";
import { InvoicesTable } from "./invoices-table";

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return null;
  }

  let invoices;
  try {
    invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            customerName: true,
            orderNumber: true,
            paymentMethod: true,
          },
      },
      company: { select: { name: true } },
    },
  });
  } catch (e) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="text-red-400 font-medium">Datenbankfehler beim Laden der Rechnungen</p>
        <p className="text-xs text-red-400/70 mt-2 break-all">{e instanceof Error ? e.message : String(e)}</p>
      </div>
    );
  }

  const now = new Date();

  const serialized = invoices.map((invoice) => {
    // Derive display status: if SENT and past due, show as OVERDUE
    let displayStatus = invoice.status;
    if (invoice.status === "SENT" && invoice.dueDate < now) {
      displayStatus = "OVERDUE";
    }

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.order?.customerName ?? invoice.recipientName ?? "–",
      companyName: invoice.company.name,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
      displayStatus,
      dueDate: invoice.dueDate.toISOString(),
      paidAt: invoice.paidAt?.toISOString() ?? null,
      createdAt: invoice.createdAt.toISOString(),
    };
  });

  const totalCount = invoices.length;
  const draftCount = invoices.filter((i) => i.status === "DRAFT").length;
  const sentCount = invoices.filter((i) => i.status === "SENT").length;
  const paidCount = invoices.filter((i) => i.status === "PAID").length;
  const overdueCount = serialized.filter(
    (i) => i.displayStatus === "OVERDUE"
  ).length;

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
              Rechnungen
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalCount} Rechnungen insgesamt
            </p>
          </div>
        </div>
        <Link
          href="/accounting/invoices/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#F6A11C] px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#F6A11C]/80"
        >
          Neue Rechnung
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="rounded-xl border border-white/[0.10] bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Gesamt
          </p>
          <p className="text-2xl font-bold text-zinc-200 tabular-nums">
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
            Bezahlt
          </p>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">
            {paidCount}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.10] bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            &Uuml;berf&auml;llig
          </p>
          <p className="text-2xl font-bold text-red-400 tabular-nums">
            {overdueCount}
          </p>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-white/[0.10] bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.10]">
          <h2 className="text-sm font-semibold text-zinc-300">
            Alle Rechnungen
          </h2>
        </div>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <IconFileInvoice className="size-10 mb-3 text-zinc-400" />
            <p className="text-sm">Noch keine Rechnungen vorhanden</p>
          </div>
        ) : (
          <InvoicesTable invoices={serialized} />
        )}
      </div>
    </div>
  );
}
