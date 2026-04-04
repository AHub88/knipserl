import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ConvertToInvoice } from "./convert-to-invoice";
import { SendEmailButton } from "@/components/accounting/send-email-button";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Entwurf",
    className: "bg-[#2a2b30]/80 text-zinc-400 border border-zinc-500/30",
  },
  SENT: {
    label: "Versendet",
    className: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  ACCEPTED: {
    label: "Angenommen",
    className:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  REJECTED: {
    label: "Abgelehnt",
    className: "bg-red-500/15 text-red-400 border border-red-500/30",
  },
};

function formatEUR(amount: number) {
  return amount.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type LineItem = {
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  optional?: boolean;
};

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    select: {
      id: true,
      quoteNumber: true,
      items: true,
      totalAmount: true,
      status: true,
      validUntil: true,
      createdAt: true,
      sentAt: true,
      orderId: true,
      companyId: true,
      company: { select: { id: true, name: true, address: true, city: true, zip: true, taxNumber: true, email: true, phone: true, bankName: true, bankIban: true, bankBic: true, isKleinunternehmer: true, invoicePrefix: true, quotePrefix: true } },
      order: { select: { id: true, customerName: true, customerEmail: true, orderNumber: true } },
    },
  });

  if (!quote) notFound();

  const q = quote!;
  const items = q.items as LineItem[];
  const status = statusConfig[q.status] ?? statusConfig.DRAFT;
  const isGbr = q.company.name.includes("GbR");

  const optionalItems = items.filter((item) => item.optional);

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="rounded-2xl border border-white/[0.10] bg-card shadow-lg shadow-black/30 p-4 sm:p-6">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/accounting/quotes"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-zinc-300 transition-colors"
            >
              &larr; Zur&uuml;ck
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100 font-mono">
              {q.quoteNumber}
            </h1>
            <span
              className={
                "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold " +
                status.className
              }
            >
              {status.label}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <SendEmailButton
              type="quote"
              id={q.id}
              recipientEmail={q.order?.customerEmail}
              alreadySent={!!q.sentAt}
            />
            <a
              href={`/api/accounting/pdf?type=quote&id=${q.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/[0.10] bg-card px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-[#1c1d20] hover:text-zinc-100"
            >
              PDF
            </a>

            {q.status !== "REJECTED" && (
              <a
                href={`#convert`}
                className="rounded-lg border border-white/[0.10] bg-card px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-[#1c1d20] hover:text-zinc-100"
              >
                In Rechnung umwandeln
              </a>
            )}

            {q.status === "DRAFT" && (
              <StatusButton
                quoteId={q.id}
                action="SENT"
                label="Als gesendet markieren"
                className="bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25"
              />
            )}

            {q.status === "SENT" && (
              <>
                <StatusButton
                  quoteId={q.id}
                  action="ACCEPTED"
                  label="Angenommen"
                  className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                />
                <StatusButton
                  quoteId={q.id}
                  action="REJECTED"
                  label="Abgelehnt"
                  className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                />
              </>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/[0.10] pt-6">
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-zinc-100">
                {q.order?.customerName ?? "–"}
              </p>
            </div>
            <div>
              <span
                className={
                  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase " +
                  (isGbr
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/30")
                }
              >
                {q.company.name}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">G&uuml;ltig bis</span>
              <span className="text-zinc-200 tabular-nums">
                {formatDate(q.validUntil)}
              </span>
            </div>
            {false && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Lieferdatum</span>
                <span className="text-zinc-200 tabular-nums">
                  {formatDate(q.deliveryDate)}
                </span>
              </div>
            )}
            {q.order && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Auftrag</span>
                <Link
                  href={`/orders/${q.order.id}`}
                  className="text-[#F6A11C] hover:text-[#F6A11C]/80 transition-colors"
                >
                  #{q.order.orderNumber}
                </Link>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-400">Erstellt am</span>
              <span className="text-zinc-200 tabular-nums">
                {formatDate(q.createdAt)}
              </span>
            </div>
            {q.sentAt && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Gesendet am</span>
                <span className="text-zinc-200 tabular-nums">
                  {formatDate(q.sentAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="rounded-xl border border-white/[0.10] bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.10]">
          <h2 className="text-sm font-semibold text-zinc-300">Positionen</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.10]">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-12">
                  Pos
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Beschreibung
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-24">
                  Menge
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-32">
                  Einzelpreis
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-32">
                  Gesamt
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className={
                    "border-b border-white/[0.10] last:border-b-0" +
                    (item.optional
                      ? " border-dashed opacity-60"
                      : "")
                  }
                >
                  <td className="px-6 py-3 text-zinc-400 tabular-nums">
                    {index + 1}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-200 font-medium">
                        {item.title}
                      </span>
                      {item.optional && (
                        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
                          (optional)
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right text-zinc-300 tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-3 text-right text-zinc-300 tabular-nums font-mono text-xs">
                    {formatEUR(item.unitPrice)}
                  </td>
                  <td className="px-6 py-3 text-right text-zinc-200 tabular-nums font-mono text-xs font-medium">
                    {formatEUR(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-white/[0.10] px-6 py-4">
          <div className="flex items-center justify-end gap-6">
            <span className="text-sm font-medium text-zinc-400">
              Gesamtbetrag
            </span>
            <span className="text-xl font-bold text-zinc-100 tabular-nums font-mono">
              {formatEUR(q.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {q.notes && (
        <div className="rounded-xl border border-white/[0.10] bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.10]">
            <h2 className="text-sm font-semibold text-zinc-300">Notizen</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-zinc-400 whitespace-pre-line">
              {q.notes}
            </p>
          </div>
        </div>
      )}

      {/* Convert to Invoice Section */}
      {(q.status === "ACCEPTED" || q.status === "SENT") && (
        <div id="convert">
          <ConvertToInvoice
            quoteId={q.id}
            optionalItems={optionalItems.map((item) => ({
              title: item.title,
              description: item.description,
              total: item.total,
            }))}
          />
        </div>
      )}
    </div>
  );
}

function StatusButton({
  quoteId,
  action,
  label,
  className,
}: {
  quoteId: string;
  action: string;
  label: string;
  className: string;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await prisma.quote.update({
          where: { id: quoteId },
          data: {
            status: action as "SENT" | "ACCEPTED" | "REJECTED",
            ...(action === "SENT" && { sentAt: new Date() }),
          },
        });
        const { revalidatePath } = await import("next/cache");
        revalidatePath(`/accounting/quotes/${quoteId}`);
      }}
    >
      <button
        type="submit"
        className={
          "rounded-lg px-4 py-2 text-sm font-medium transition-colors " +
          className
        }
      >
        {label}
      </button>
    </form>
  );
}
