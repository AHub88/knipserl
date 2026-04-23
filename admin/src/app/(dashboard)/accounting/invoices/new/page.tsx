import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { IconFileInvoice } from "@tabler/icons-react";
import Link from "next/link";
import { InvoiceForm } from "./invoice-form";

export default async function NewInvoicePage() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return null;
  }

  let orders;
  let companies;
  try {
    [orders, companies] = await Promise.all([
      prisma.order.findMany({
        where: { paymentMethod: "INVOICE" },
        orderBy: { eventDate: "desc" },
        take: 50,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          price: true,
          companyId: true,
        },
      }),
      prisma.company.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);
  } catch (e) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="text-red-400 font-medium">Fehler beim Laden</p>
        <p className="text-xs text-red-400/70 mt-2 break-all">{e instanceof Error ? e.message : String(e)}</p>
      </div>
    );
  }

  const serializedOrders = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    price: order.price,
    companyId: order.companyId,
    hasInvoice: false,
  }));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
            <IconFileInvoice className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Neue Rechnung
            </h1>
            <p className="text-sm text-muted-foreground">
              Rechnung erstellen und an den Kunden senden
            </p>
          </div>
        </div>
      </div>

      {/* Back link */}
      <Link
        href="/accounting/invoices"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground/80 transition-colors"
      >
        &larr; Zur&uuml;ck zur &Uuml;bersicht
      </Link>

      {/* Form */}
      <InvoiceForm companies={companies} orders={serializedOrders} />
    </div>
  );
}
