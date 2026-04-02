import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IconFileInvoice } from "@tabler/icons-react";
import Link from "next/link";
import { IncomingTable } from "./incoming-table";

export default async function IncomingInvoicesPage() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    redirect("/");
  }

  const invoices = await prisma.incomingInvoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { name: true } } },
  });

  const serialized = invoices.map((inv) => ({
    id: inv.id,
    vendor: inv.vendor,
    invoiceNumber: inv.invoiceNumber,
    amount: inv.amount,
    category: inv.category,
    companyName: inv.company.name,
    status: inv.status,
    dueDate: inv.dueDate?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
  }));

  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  const pendingAmount = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((s, i) => s + i.amount, 0);
  const paidAmount = invoices
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + i.amount, 0);
  const overdueAmount = invoices
    .filter((i) => i.status === "OVERDUE")
    .reduce((s, i) => s + i.amount, 0);

  const fmt = (v: number) =>
    v.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
              Eingangsrechnungen
            </h1>
            <p className="text-sm text-muted-foreground">
              {invoices.length} Rechnungen insgesamt
            </p>
          </div>
        </div>
        <Link
          href="/accounting/incoming/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#F6A11C] px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-[#F6A11C]/90"
        >
          Neue Eingangsrechnung
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/[0.10] bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Gesamt
          </p>
          <p className="text-2xl font-bold text-zinc-100 tabular-nums">
            {fmt(totalAmount)}&nbsp;&euro;
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.10] bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Ausstehend
          </p>
          <p className="text-2xl font-bold text-amber-400 tabular-nums">
            {fmt(pendingAmount)}&nbsp;&euro;
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.10] bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Bezahlt
          </p>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">
            {fmt(paidAmount)}&nbsp;&euro;
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.10] bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            &Uuml;berf&auml;llig
          </p>
          <p className="text-2xl font-bold text-red-400 tabular-nums">
            {fmt(overdueAmount)}&nbsp;&euro;
          </p>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-white/[0.10] bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.10]">
          <h2 className="text-sm font-semibold text-zinc-300">
            Alle Eingangsrechnungen
          </h2>
        </div>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <IconFileInvoice className="size-10 mb-3 text-zinc-400" />
            <p className="text-sm">Noch keine Eingangsrechnungen vorhanden</p>
          </div>
        ) : (
          <IncomingTable invoices={serialized} />
        )}
      </div>
    </div>
  );
}
