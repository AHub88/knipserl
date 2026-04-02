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

  // Only orders with INVOICE payment method that don't already have an invoice
  const orders = await prisma.order.findMany({
    where: {
      paymentMethod: "INVOICE",
    },
    orderBy: { eventDate: "desc" },
    include: {
      company: { select: { id: true, name: true } },
      invoices: { select: { id: true } },
    },
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
    hasInvoice: order.invoices.length > 0,
  }));

  const companies = await prisma.company.findMany({
    select: { id: true, name: true, isKleinunternehmer: true },
  });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconFileInvoice className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Neue Rechnung
          </h1>
          <p className="text-sm text-zinc-500">
            <Link
              href="/accounting/invoices"
              className="text-[#F6A11C] hover:underline"
            >
              Rechnungen
            </Link>
            {" / Neue Rechnung erstellen"}
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-white/[0.10] bg-white/[0.04] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.10]">
          <h2 className="text-sm font-semibold text-zinc-300">
            Rechnungsdetails
          </h2>
        </div>
        <div className="p-6">
          <InvoiceForm
            orders={serializedOrders}
            companies={companies}
          />
        </div>
      </div>
    </div>
  );
}
