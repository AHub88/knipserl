import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconFileText,
  IconFileInvoice,
  IconReceipt,
  IconExternalLink,
  IconNotes,
} from "@tabler/icons-react";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { eventDate: "desc" },
        include: { company: { select: { name: true } }, driver: { select: { name: true, initials: true } } },
      },
    },
  });

  if (!customer) notFound();

  // Fetch quotes and invoices separately (FK constraints may not exist yet)
  let quotes: { id: string; quoteNumber: string; totalAmount: number; status: string; createdAt: Date; company: { name: string } }[] = [];
  let invoices: { id: string; invoiceNumber: string; totalAmount: number; status: string; createdAt: Date; company: { name: string } }[] = [];

  try {
    const q = await prisma.quote.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: { company: { select: { name: true } } },
    });
    quotes = q as unknown as typeof quotes;
  } catch { /* customerId column or FK may not exist */ }

  try {
    const inv = await prisma.invoice.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: { company: { select: { name: true } } },
    });
    invoices = inv as unknown as typeof invoices;
  } catch { /* customerId column or FK may not exist */ }

  const fmtDate = (d: Date) => d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtAmt = (v: number) => v.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €";
  const totalRevenue = customer.orders.reduce((s, o) => s + o.price, 0);

  const sc: Record<string, string> = {
    DRAFT: "bg-zinc-500/15 text-muted-foreground", SENT: "bg-blue-500/15 text-blue-400",
    ACCEPTED: "bg-emerald-500/15 text-emerald-400", REJECTED: "bg-red-500/15 text-red-400",
    PAID: "bg-emerald-500/15 text-emerald-400", OVERDUE: "bg-red-500/15 text-red-400",
    CANCELLED: "bg-zinc-500/15 text-muted-foreground", OPEN: "bg-amber-500/15 text-amber-400",
    ASSIGNED: "bg-blue-500/15 text-blue-400", COMPLETED: "bg-emerald-500/15 text-emerald-400",
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-border bg-card shadow-lg shadow-black/5 dark:shadow-black/25 p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <Link href="/customers" className="flex items-center justify-center size-9 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <IconArrowLeft className="size-4" />
          </Link>
          <span className="text-xs text-muted-foreground">Kunde</span>
          <span className={"ml-auto inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border " + (customer.customerType === "BUSINESS" ? "bg-blue-500/15 text-blue-400 border-blue-500/25" : "bg-zinc-500/15 text-muted-foreground border-zinc-500/25")}>
            {customer.customerType === "BUSINESS" ? "Geschäftskunde" : "Privatkunde"}
          </span>
        </div>

        <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-3">{customer.name}</h1>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {customer.email && <span className="flex items-center gap-1.5 text-muted-foreground"><IconMail className="size-3.5" />{customer.email}</span>}
          {customer.phone && <span className="flex items-center gap-1.5 text-muted-foreground"><IconPhone className="size-3.5" />{customer.phone}</span>}
          {customer.company && <span className="flex items-center gap-1.5 text-muted-foreground"><IconBriefcase className="size-3.5" />{customer.company}</span>}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums whitespace-nowrap">{customer.orders.length}</p>
            <p className="text-[11px] text-muted-foreground/70">Aufträge</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums whitespace-nowrap">{fmtAmt(totalRevenue)}</p>
            <p className="text-[11px] text-muted-foreground/70">Umsatz</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums whitespace-nowrap">{quotes.length + invoices.length}</p>
            <p className="text-[11px] text-muted-foreground/70">Dokumente</p>
          </div>
        </div>
      </div>

      {/* Orders */}
      {customer.orders.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <IconFileText className="size-4 text-primary" /> Aufträge ({customer.orders.length})
            </h2>
          </div>
          <div className="p-4 sm:p-5">
          <div className="space-y-2">
            {customer.orders.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="block rounded-lg border border-border p-3 hover:bg-muted transition-colors group"
              >
                {/* Mobile: stacked card */}
                <div className="flex flex-col gap-2 sm:hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground/70">#{o.orderNumber}</span>
                    <span className={"rounded px-1.5 py-0.5 text-[10px] font-semibold " + (sc[o.status] || "")}>{o.status}</span>
                  </div>
                  <div className="text-sm text-foreground leading-snug">{o.eventType}</div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground/70">{fmtDate(o.eventDate)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-foreground/80 tabular-nums whitespace-nowrap">{fmtAmt(o.price)}</span>
                      <IconExternalLink className="size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
                    </div>
                  </div>
                </div>
                {/* Desktop: inline row */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground/70">#{o.orderNumber}</span>
                    <span className="text-sm text-foreground truncate">{o.eventType}</span>
                    <span className="text-xs text-muted-foreground/70">{fmtDate(o.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono text-foreground/80 tabular-nums">{fmtAmt(o.price)}</span>
                    <span className={"rounded px-1.5 py-0.5 text-[10px] font-semibold " + (sc[o.status] || "")}>{o.status}</span>
                    <IconExternalLink className="size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* Quotes */}
      {quotes.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <IconFileInvoice className="size-4 text-primary" /> Angebote ({quotes.length})
            </h2>
          </div>
          <div className="p-4 sm:p-5">
          <div className="space-y-2">
            {quotes.map((q) => (
              <Link
                key={q.id}
                href={`/accounting/quotes/${q.id}`}
                className="block rounded-lg border border-border p-3 hover:bg-muted transition-colors group"
              >
                {/* Mobile */}
                <div className="flex flex-col gap-2 sm:hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground/70">{q.quoteNumber}</span>
                    <span className={"rounded px-1.5 py-0.5 text-[10px] font-semibold " + (sc[q.status] || "")}>{q.status}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground/70">{fmtDate(q.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-foreground/80 tabular-nums whitespace-nowrap">{fmtAmt(q.totalAmount)}</span>
                      <IconExternalLink className="size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
                    </div>
                  </div>
                </div>
                {/* Desktop */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground/70">{q.quoteNumber}</span>
                    <span className="text-xs text-muted-foreground/70">{fmtDate(q.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono text-foreground/80 tabular-nums">{fmtAmt(q.totalAmount)}</span>
                    <span className={"rounded px-1.5 py-0.5 text-[10px] font-semibold " + (sc[q.status] || "")}>{q.status}</span>
                    <IconExternalLink className="size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* Invoices */}
      {invoices.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <IconReceipt className="size-4 text-primary" /> Rechnungen ({invoices.length})
            </h2>
          </div>
          <div className="p-4 sm:p-5">
          <div className="space-y-2">
            {invoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/accounting/invoices/${inv.id}`}
                className="block rounded-lg border border-border p-3 hover:bg-muted transition-colors group"
              >
                {/* Mobile */}
                <div className="flex flex-col gap-2 sm:hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground/70">{inv.invoiceNumber}</span>
                    <span className={"rounded px-1.5 py-0.5 text-[10px] font-semibold " + (sc[inv.status] || "")}>{inv.status}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground/70">{fmtDate(inv.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-foreground/80 tabular-nums whitespace-nowrap">{fmtAmt(inv.totalAmount)}</span>
                      <IconExternalLink className="size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
                    </div>
                  </div>
                </div>
                {/* Desktop */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground/70">{inv.invoiceNumber}</span>
                    <span className="text-xs text-muted-foreground/70">{fmtDate(inv.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono text-foreground/80 tabular-nums">{fmtAmt(inv.totalAmount)}</span>
                    <span className={"rounded px-1.5 py-0.5 text-[10px] font-semibold " + (sc[inv.status] || "")}>{inv.status}</span>
                    <IconExternalLink className="size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          </div>
        </div>
      )}

      {customer.notes && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3 flex items-center gap-2">
            <IconNotes className="size-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notizen</h2>
          </div>
          <div className="p-4 sm:p-5">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{customer.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
