import { prisma } from "@/lib/db";
import { IconFileInvoice } from "@tabler/icons-react";
import Link from "next/link";
import { QuoteForm } from "./quote-form";

export default async function NewQuotePage() {
  // Fetch orders that don't have a quote yet
  const orders = await prisma.order.findMany({
    where: {
      quotes: { none: {} },
    },
    orderBy: { eventDate: "desc" },
    include: { company: true },
  });

  const serializedOrders = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    eventType: order.eventType,
    eventDate: order.eventDate.toISOString(),
    price: order.price,
    companyId: order.company.id,
    companyName: order.company.name,
  }));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
            <IconFileInvoice className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Neues Angebot
            </h1>
            <p className="text-sm text-zinc-500">
              Angebot erstellen und an den Kunden senden
            </p>
          </div>
        </div>
      </div>

      {/* Back link */}
      <Link
        href="/accounting/quotes"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        &larr; Zur&uuml;ck zur &Uuml;bersicht
      </Link>

      {/* Form card */}
      <div className="rounded-xl border border-white/[0.10] bg-white/[0.04] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.10]">
          <h2 className="text-sm font-semibold text-zinc-300">
            Angebot erstellen
          </h2>
        </div>
        <div className="p-6">
          {serializedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <IconFileInvoice className="size-10 mb-3 text-zinc-400" />
              <p className="text-sm">
                Keine Auftr&auml;ge ohne Angebot vorhanden
              </p>
            </div>
          ) : (
            <QuoteForm orders={serializedOrders} />
          )}
        </div>
      </div>
    </div>
  );
}
