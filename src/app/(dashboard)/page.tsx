import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconInbox,
  IconFileText,
  IconCalendarEvent,
  IconUsers,
} from "@tabler/icons-react";
import {
  Sparkline,
  MonthlyOrdersChart,
  EventTypesPieChart,
  UpcomingOrdersList,
} from "@/components/dashboard/charts";

export default async function DashboardPage() {
  const session = await auth();
  const isAccountingAdmin = session?.user?.role === "ADMIN_ACCOUNTING";

  const paymentFilter = isAccountingAdmin
    ? { paymentMethod: "INVOICE" as const }
    : {};

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    newInquiries,
    openOrders,
    completedThisMonth,
    activeDrivers,
    recentOrders,
    monthlyOrderCounts,
    eventTypeCounts,
  ] = await Promise.all([
    // KPI 1: new inquiries
    prisma.inquiry.count({ where: { status: "NEW" } }),

    // KPI 2: open orders
    prisma.order.count({
      where: {
        status: { in: ["OPEN", "ASSIGNED"] },
        ...paymentFilter,
      },
    }),

    // KPI 3: completed this month
    prisma.order.count({
      where: {
        status: "COMPLETED",
        completedAt: { gte: startOfMonth },
        ...paymentFilter,
      },
    }),

    // KPI 4: active drivers
    prisma.user.count({
      where: { role: "DRIVER", active: true },
    }),

    // Upcoming orders list
    prisma.order.findMany({
      where: {
        status: { in: ["OPEN", "ASSIGNED"] },
        ...paymentFilter,
      },
      orderBy: { eventDate: "asc" },
      take: 6,
      include: { driver: true },
    }),

    // Monthly orders for area chart (last 6 months)
    prisma.order
      .groupBy({
        by: ["eventDate"],
        _count: { _all: true },
        where: {
          eventDate: {
            gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          },
          ...paymentFilter,
        },
      })
      .then((rows) => {
        // Bucket by month
        const buckets = new Map<string, number>();
        for (const row of rows) {
          const d = new Date(row.eventDate);
          const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
          buckets.set(key, (buckets.get(key) ?? 0) + row._count._all);
        }
        // Build sorted array for last 6 months
        const monthNames = [
          "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
          "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
        ];
        const result: { month: string; orders: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
          result.push({
            month: monthNames[d.getMonth()],
            orders: buckets.get(key) ?? 0,
          });
        }
        return result;
      })
      .catch(() => [] as { month: string; orders: number }[]),

    // Event type distribution
    prisma.order.groupBy({
      by: ["eventType"],
      _count: { eventType: true },
      where: paymentFilter,
      orderBy: { _count: { eventType: "desc" } },
      take: 5,
    }),
  ]);

  // Transform data for charts
  const monthlyChartData =
    monthlyOrderCounts.length > 0 ? monthlyOrderCounts : undefined;

  const eventTypeData =
    eventTypeCounts.length > 0
      ? eventTypeCounts.map((row) => ({
          name: row.eventType,
          value: row._count.eventType,
        }))
      : undefined; // falls back to mock data in the chart

  // Serialize orders for the client component
  const upcomingOrders = recentOrders.map((order) => ({
    id: order.id,
    customerName: order.customerName,
    locationName: order.locationName,
    eventType: order.eventType,
    eventDate: order.eventDate.toISOString(),
    status: order.status,
    driverName: order.driver?.name ?? null,
  }));

  // KPI card definitions
  const kpiCards = [
    {
      label: "Neue Anfragen",
      value: newInquiries,
      icon: IconInbox,
      sparkline: [3, 5, 2, 8, 6, newInquiries],
      color: "#F6A11C",
      bgClass: "bg-[#F6A11C]/10",
      iconClass: "text-[#F6A11C]",
    },
    {
      label: "Offene Auftr\u00e4ge",
      value: openOrders,
      icon: IconFileText,
      sparkline: [10, 8, 14, 11, 9, openOrders],
      color: "#3b82f6",
      bgClass: "bg-blue-500/10",
      iconClass: "text-blue-400",
    },
    {
      label: "Abgeschlossen (Monat)",
      value: completedThisMonth,
      icon: IconCalendarEvent,
      sparkline: [4, 7, 5, 9, 12, completedThisMonth],
      color: "#22c55e",
      bgClass: "bg-emerald-500/10",
      iconClass: "text-emerald-400",
    },
    {
      label: "Aktive Fahrer",
      value: activeDrivers,
      icon: IconUsers,
      sparkline: [2, 3, 3, 4, 4, activeDrivers],
      color: "#a855f7",
      bgClass: "bg-purple-500/10",
      iconClass: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Willkommen zur&uuml;ck, {session?.user?.name}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className="border-white/5 bg-white/[0.02] backdrop-blur"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div
                      className={`inline-flex items-center justify-center rounded-lg p-2 ${kpi.bgClass}`}
                    >
                      <Icon className={`h-5 w-5 ${kpi.iconClass}`} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold tracking-tight text-zinc-100 tabular-nums">
                        {kpi.value}
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500">
                        {kpi.label}
                      </p>
                    </div>
                  </div>
                  <Sparkline data={kpi.sparkline} color={kpi.color} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MonthlyOrdersChart data={monthlyChartData} />
        </div>
        <div className="lg:col-span-2">
          <EventTypesPieChart data={eventTypeData} />
        </div>
      </div>

      {/* Upcoming Orders */}
      <Card className="border-white/5 bg-white/[0.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-zinc-100">
            N&auml;chste Auftr&auml;ge
          </CardTitle>
          <p className="text-sm text-zinc-500">
            Die n&auml;chsten anstehenden Events &mdash; klicken zum
            &Ouml;ffnen
          </p>
        </CardHeader>
        <CardContent>
          <UpcomingOrdersList orders={upcomingOrders} />
        </CardContent>
      </Card>
    </div>
  );
}
