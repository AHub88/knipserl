import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CustomerDetail } from "./customer-detail";

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
        include: { driver: { select: { name: true, initials: true } } },
      },
    },
  });

  if (!customer) notFound();

  return (
    <CustomerDetail
      customer={{
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        customerType: customer.customerType,
        notes: customer.notes,
      }}
      orders={customer.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        eventType: o.eventType,
        eventDate: o.eventDate.toISOString(),
        locationName: o.locationName,
        price: o.price,
        paid: o.paid,
        driverName: o.driver?.name ?? null,
        driverInitials: o.driver?.initials ?? null,
      }))}
    />
  );
}
