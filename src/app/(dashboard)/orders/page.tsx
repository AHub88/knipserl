import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { IconFileText } from "@tabler/icons-react";
import { OrdersTable } from "./orders-table";

export default async function OrdersPage() {
  const session = await auth();
  const isAccountingAdmin = session?.user?.role === "ADMIN_ACCOUNTING";

  const orders = await prisma.order.findMany({
    where: isAccountingAdmin ? { paymentMethod: "INVOICE" } : {},
    orderBy: { eventDate: "desc" },
    include: { driver: true, company: true },
  });

  const serialized = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    eventType: order.eventType,
    eventDate: order.eventDate.toISOString(),
    driverName: order.driver?.name ?? null,
    price: order.price,
    paymentMethod: order.paymentMethod,
    companyName: order.company.name,
    status: order.status,
  }));

  const openCount = orders.filter((o) => o.status === "OPEN").length;
  const assignedCount = orders.filter((o) => o.status === "ASSIGNED").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
            <IconFileText className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Auftr&auml;ge
            </h1>
            <p className="text-sm text-zinc-500">
              {orders.length} Auftr&auml;ge insgesamt
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Offen
          </p>
          <p className="text-2xl font-bold text-amber-400 tabular-nums">
            {openCount}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Zugewiesen
          </p>
          <p className="text-2xl font-bold text-blue-400 tabular-nums">
            {assignedCount}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Abgeschlossen
          </p>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-zinc-300">
            Alle Auftr&auml;ge
          </h2>
        </div>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <IconFileText className="size-10 mb-3 text-zinc-600" />
            <p className="text-sm">Noch keine Auftr&auml;ge vorhanden</p>
          </div>
        ) : (
          <OrdersTable orders={serialized} />
        )}
      </div>
    </div>
  );
}
