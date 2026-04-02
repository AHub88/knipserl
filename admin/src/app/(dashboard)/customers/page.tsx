import { prisma } from "@/lib/db";
import { IconUsers } from "@tabler/icons-react";
import { CustomersTable } from "./customers-table";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { orders: true } },
      orders: {
        orderBy: { eventDate: "desc" },
        take: 1,
        select: { eventDate: true },
      },
    },
  });

  const serialized = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    company: c.company,
    customerType: c.customerType,
    orderCount: c._count.orders,
    lastOrderDate: c.orders[0]?.eventDate?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconUsers className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Kunden
          </h1>
          <p className="text-sm text-muted-foreground">
            {customers.length} Kunden gesamt
          </p>
        </div>
      </div>

      <CustomersTable customers={serialized} />
    </div>
  );
}
