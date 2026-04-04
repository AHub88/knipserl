import { prisma } from "@/lib/db";
import { IconFileInvoice } from "@tabler/icons-react";
import Link from "next/link";
import { QuoteForm } from "./quote-form";

export default async function NewQuotePage() {
  const [orders, companies] = await Promise.all([
    prisma.order.findMany({
      where: {
        quotes: { none: {} },
      },
      orderBy: { eventDate: "desc" },
      include: { company: true },
    }),
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const serializedOrders = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    price: order.price,
    companyId: order.company.id,
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
            <p className="text-sm text-muted-foreground">
              Angebot erstellen und an den Kunden senden
            </p>
          </div>
        </div>
      </div>

      {/* Back link */}
      <Link
        href="/accounting/quotes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-zinc-300 transition-colors"
      >
        &larr; Zur&uuml;ck zur &Uuml;bersicht
      </Link>

      {/* Form */}
      <QuoteForm companies={companies} orders={serializedOrders} />
    </div>
  );
}
