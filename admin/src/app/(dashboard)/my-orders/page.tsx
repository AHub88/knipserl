import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { MyOrdersTabs } from "./my-orders-tabs";
import { IconPackage } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const impersonateId = cookieStore.get("impersonateDriverId")?.value;
  const driverId = (session!.user.role === "ADMIN" && impersonateId) ? impersonateId : session!.user.id;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const [upcomingOrders, pastOrders, openOrders] = await Promise.all([
    prisma.order.findMany({
      where: { driverId, status: { not: "CANCELLED" }, eventDate: { gte: now } },
      orderBy: { eventDate: "asc" },
    }),
    prisma.order.findMany({
      where: { driverId, eventDate: { lt: now } },
      orderBy: { eventDate: "desc" },
      take: 15,
    }),
    prisma.order.findMany({
      where: { status: "OPEN", driverId: null },
      orderBy: { eventDate: "asc" },
    }),
  ]);

  const serialize = (orders: typeof upcomingOrders) =>
    orders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      eventDate: o.eventDate.toISOString(),
      eventType: o.eventType,
      locationName: o.locationName,
      locationAddress: o.locationAddress,
      extras: o.extras,
      notes: o.notes,
      status: o.status,
      compensation: Math.abs(o.setupCost ?? 0),
      setupDate: o.setupDate?.toISOString() ?? null,
      setupTime: o.setupTime ?? null,
      teardownDate: o.teardownDate?.toISOString() ?? null,
      teardownTime: o.teardownTime ?? null,
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-9 rounded-xl bg-blue-500/10">
          <IconPackage className="size-4.5 text-blue-400" />
        </div>
        <h1 className="text-lg font-bold text-zinc-100">Meine Aufträge</h1>
      </div>

      <MyOrdersTabs
        assignedOrders={serialize(upcomingOrders)}
        pastOrders={serialize(pastOrders)}
        openOrders={serialize(openOrders)}
        nowIso={now.toISOString()}
      />
    </div>
  );
}
