import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPaymentFilter } from "@/lib/view-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconInbox,
  IconFileText,
  IconCalendarEvent,
  IconUsers,
  IconCurrencyEuro,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";
import {
  Sparkline,
  MonthlyOrdersChart,
  EventTypesPieChart,
  UpcomingOrdersList,
} from "@/components/dashboard/charts";

export default async function DashboardPage() {
  const session = await auth();
  const paymentFilter = await getPaymentFilter(session?.user?.role ?? "");

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

  // Revenue calculations
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
  const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

  const [revenueThisMonth, revenueLastMonth, revenueYTD, revenueLastYear, monthlyRevenue] = await Promise.all([
    // This month
    prisma.order.aggregate({
      _sum: { price: true },
      where: { eventDate: { gte: startOfMonth }, ...paymentFilter },
    }),
    // Last month
    prisma.order.aggregate({
      _sum: { price: true },
      where: { eventDate: { gte: startOfLastMonth, lte: endOfLastMonth }, ...paymentFilter },
    }),
    // Year to date
    prisma.order.aggregate({
      _sum: { price: true },
      where: { eventDate: { gte: startOfYear }, ...paymentFilter },
    }),
    // Last year total
    prisma.order.aggregate({
      _sum: { price: true },
      where: { eventDate: { gte: startOfLastYear, lte: endOfLastYear }, ...paymentFilter },
    }),
    // Monthly revenue for chart (last 12 months)
    prisma.order.findMany({
      where: {
        eventDate: { gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) },
        ...paymentFilter,
      },
      select: { eventDate: true, price: true },
    }),
  ]);

  const revThisMonth = revenueThisMonth._sum.price ?? 0;
  const revLastMonth = revenueLastMonth._sum.price ?? 0;
  const revYTD = revenueYTD._sum.price ?? 0;
  const revLastYear = revenueLastYear._sum.price ?? 0;
  const monthChangePercent = revLastMonth > 0 ? Math.round(((revThisMonth - revLastMonth) / revLastMonth) * 100) : 0;

  // Build monthly revenue chart data
  const monthNames12 = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const revenueBuckets = new Map<string, number>();
  for (const o of monthlyRevenue) {
    const d = new Date(o.eventDate);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    revenueBuckets.set(key, (revenueBuckets.get(key) ?? 0) + o.price);
  }
  const revenueChartData: { month: string; revenue: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    revenueChartData.push({
      month: monthNames12[d.getMonth()],
      revenue: Math.round(revenueBuckets.get(key) ?? 0),
    });
  }

  // Yearly comparison - all years (unfiltered for BAR stats)
  const allOrders = await prisma.order.findMany({
    select: { eventDate: true, price: true, paymentMethod: true, travelCost: true, setupCost: true, extras: true },
  });

  type YearStats = {
    revenue: number;
    count: number;
    cashCount: number;
    travelCosts: number;
    driverCosts: number;
    extras: Record<string, number>;
  };
  const yearlyStats = new Map<number, YearStats>();
  for (const o of allOrders) {
    const y = new Date(o.eventDate).getFullYear();
    const existing = yearlyStats.get(y) ?? { revenue: 0, count: 0, cashCount: 0, travelCosts: 0, driverCosts: 0, extras: {} };
    existing.revenue += o.price;
    existing.count++;
    if (o.paymentMethod === "CASH") existing.cashCount++;
    if (o.travelCost) existing.travelCosts += Math.abs(o.travelCost);
    // setupCost = Fahrer-Vergütung (negativ in DB)
    const setupVal = (o as any).setupCost;
    if (setupVal) existing.driverCosts = (existing.driverCosts ?? 0) + Math.abs(setupVal);
    for (const ext of o.extras) {
      existing.extras[ext] = (existing.extras[ext] ?? 0) + 1;
    }
    yearlyStats.set(y, existing);
  }
  const yearlyData = [...yearlyStats.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, data]) => ({
      year,
      ...data,
      cashPercent: data.count > 0 ? Math.round((data.cashCount / data.count) * 100) : 0,
      avgRevenue: data.count > 0 ? Math.round(data.revenue / data.count) : 0,
    }));

  // All extras used across all years
  const allExtrasSet = new Set<string>();
  for (const y of yearlyData) {
    for (const key of Object.keys(y.extras)) allExtrasSet.add(key);
  }
  const allExtrasKeys = [...allExtrasSet].sort();

  // YTD comparison: last 4 years at same date
  const ytdDateLabel = now.toLocaleDateString("de-DE", { day: "2-digit", month: "long" });
  const ytdYears: { year: number; revenue: number; count: number }[] = [];
  for (let yi = 0; yi < 4; yi++) {
    const targetYear = now.getFullYear() - yi;
    const cutoff = new Date(targetYear, now.getMonth(), now.getDate(), 23, 59, 59);
    let revenue = 0;
    let count = 0;
    for (const o of allOrders) {
      const d = new Date(o.eventDate);
      if (d.getFullYear() === targetYear && d <= cutoff) {
        revenue += o.price;
        count++;
      }
    }
    ytdYears.push({ year: targetYear, revenue, count });
  }
  ytdYears.reverse(); // oldest first

  // Monthly comparison: this year vs last year
  const monthCompare: { month: string; thisYear: number; lastYear: number }[] = [];
  const monthNamesShort = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  for (let m = 0; m < 12; m++) {
    let thisYearCount = 0;
    let lastYearCount = 0;
    for (const o of allOrders) {
      const d = new Date(o.eventDate);
      if (d.getMonth() === m) {
        if (d.getFullYear() === now.getFullYear()) thisYearCount++;
        if (d.getFullYear() === now.getFullYear() - 1) lastYearCount++;
      }
    }
    monthCompare.push({ month: monthNamesShort[m], thisYear: thisYearCount, lastYear: lastYearCount });
  }

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

      {/* YTD Comparison - last 4 years */}
      <div className="rounded-xl border border-white/[0.10] bg-white/[0.04] shadow-lg shadow-black/30 p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
          Standpunkt heute ({ytdDateLabel})
        </h3>
        <p className="text-xs text-zinc-500 mb-5">
          Wie standen wir jeweils am {ytdDateLabel}?
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">Umsatz bis {ytdDateLabel}</p>
            <div className="space-y-2">
              {(() => {
                const maxRev = Math.max(...ytdYears.map((y) => y.revenue), 1);
                return ytdYears.map((y, i) => {
                  const isCurrentYear = y.year === now.getFullYear();
                  const prev = i > 0 ? ytdYears[i - 1] : null;
                  const change = prev && prev.revenue > 0 ? Math.round(((y.revenue - prev.revenue) / prev.revenue) * 100) : null;
                  return (
                    <div key={y.year} className="flex items-center gap-3">
                      <span className={"text-sm font-semibold w-10 tabular-nums " + (isCurrentYear ? "text-[#F6A11C]" : "text-zinc-500")}>{y.year}</span>
                      <div className="flex-1 h-8 bg-white/[0.03] rounded-md overflow-hidden">
                        <div className={"h-full rounded-md flex items-center px-2.5 " + (isCurrentYear ? "bg-[#F6A11C]/30" : "bg-zinc-700/50")} style={{ width: `${Math.max((y.revenue / maxRev) * 100, 5)}%` }}>
                          <span className={"text-[11px] font-mono font-bold tabular-nums whitespace-nowrap " + (isCurrentYear ? "text-[#F6A11C]" : "text-zinc-300")}>{y.revenue.toLocaleString("de-DE", { minimumFractionDigits: 0 })}&nbsp;&euro;</span>
                        </div>
                      </div>
                      <span className={"text-[11px] font-semibold w-12 text-right " + (change === null ? "text-zinc-500" : change >= 0 ? "text-emerald-400" : "text-red-400")}>{change === null ? "–" : `${change >= 0 ? "+" : ""}${change}%`}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">Aufträge bis {ytdDateLabel}</p>
            <div className="space-y-2">
              {(() => {
                const maxCount = Math.max(...ytdYears.map((y) => y.count), 1);
                return ytdYears.map((y, i) => {
                  const isCurrentYear = y.year === now.getFullYear();
                  const prev = i > 0 ? ytdYears[i - 1] : null;
                  const change = prev && prev.count > 0 ? Math.round(((y.count - prev.count) / prev.count) * 100) : null;
                  return (
                    <div key={y.year} className="flex items-center gap-3">
                      <span className={"text-sm font-semibold w-10 tabular-nums " + (isCurrentYear ? "text-[#F6A11C]" : "text-zinc-500")}>{y.year}</span>
                      <div className="flex-1 h-8 bg-white/[0.03] rounded-md overflow-hidden">
                        <div className={"h-full rounded-md flex items-center px-2.5 " + (isCurrentYear ? "bg-blue-500/30" : "bg-zinc-700/50")} style={{ width: `${Math.max((y.count / maxCount) * 100, 5)}%` }}>
                          <span className={"text-[11px] font-mono font-bold tabular-nums " + (isCurrentYear ? "text-blue-400" : "text-zinc-300")}>{y.count}</span>
                        </div>
                      </div>
                      <span className={"text-[11px] font-semibold w-12 text-right " + (change === null ? "text-zinc-500" : change >= 0 ? "text-emerald-400" : "text-red-400")}>{change === null ? "–" : `${change >= 0 ? "+" : ""}${change}%`}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className="border-white/10 bg-white/[0.04] backdrop-blur"
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

      {/* Yearly Comparison Charts */}
      {yearlyData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Umsatz Chart */}
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.04] shadow-lg shadow-black/30 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-4">Umsatz pro Jahr</h3>
            <div className="space-y-2.5">
              {(() => {
                const maxRev = Math.max(...yearlyData.map((d) => d.revenue), 1);
                return yearlyData.map((y) => {
                  const widthPercent = (y.revenue / maxRev) * 100;
                  const isCurrentYear = y.year === now.getFullYear();
                  const prev = yearlyData.find((d) => d.year === y.year - 1);
                  const change = prev && prev.revenue > 0
                    ? Math.round(((y.revenue - prev.revenue) / prev.revenue) * 100) : null;
                  return (
                    <div key={y.year} className="flex items-center gap-3">
                      <span className={"text-sm font-semibold w-10 tabular-nums " + (isCurrentYear ? "text-[#F6A11C]" : "text-zinc-400")}>{y.year}</span>
                      <div className="flex-1 h-7 bg-white/[0.03] rounded-md overflow-hidden">
                        <div
                          className={"h-full rounded-md flex items-center px-2 transition-all " + (isCurrentYear ? "bg-[#F6A11C]/30" : "bg-zinc-700/50")}
                          style={{ width: `${Math.max(widthPercent, 3)}%` }}
                        >
                          <span className={"text-[11px] font-mono font-semibold tabular-nums whitespace-nowrap " + (isCurrentYear ? "text-[#F6A11C]" : "text-zinc-300")}>
                            {(y.revenue / 1000).toFixed(1)}k &euro;
                          </span>
                        </div>
                      </div>
                      {change !== null && (
                        <span className={"text-[11px] font-semibold w-12 text-right " + (change >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {change >= 0 ? "+" : ""}{change}%
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Aufträge Chart */}
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.04] shadow-lg shadow-black/30 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-4">Aufträge pro Jahr</h3>
            <div className="space-y-2.5">
              {(() => {
                const maxCount = Math.max(...yearlyData.map((d) => d.count), 1);
                return yearlyData.map((y) => {
                  const widthPercent = (y.count / maxCount) * 100;
                  const isCurrentYear = y.year === now.getFullYear();
                  const prev = yearlyData.find((d) => d.year === y.year - 1);
                  const change = prev && prev.count > 0
                    ? Math.round(((y.count - prev.count) / prev.count) * 100) : null;
                  return (
                    <div key={y.year} className="flex items-center gap-3">
                      <span className={"text-sm font-semibold w-10 tabular-nums " + (isCurrentYear ? "text-[#F6A11C]" : "text-zinc-400")}>{y.year}</span>
                      <div className="flex-1 h-7 bg-white/[0.03] rounded-md overflow-hidden">
                        <div
                          className={"h-full rounded-md flex items-center px-2 transition-all " + (isCurrentYear ? "bg-blue-500/30" : "bg-zinc-700/50")}
                          style={{ width: `${Math.max(widthPercent, 3)}%` }}
                        >
                          <span className={"text-[11px] font-mono font-semibold tabular-nums whitespace-nowrap " + (isCurrentYear ? "text-blue-400" : "text-zinc-300")}>
                            {y.count}
                          </span>
                        </div>
                      </div>
                      {change !== null && (
                        <span className={"text-[11px] font-semibold w-12 text-right " + (change >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {change >= 0 ? "+" : ""}{change}%
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Additional Yearly Charts */}
      {yearlyData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* BAR vs Rechnung */}
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.04] shadow-lg shadow-black/30 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Bar vs. Rechnung</h3>
            <div className="flex items-center gap-4 mb-4 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" />Bar</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-400" />Rechnung</span>
            </div>
            <div className="space-y-2.5">
              {yearlyData.map((y) => {
                const invoiceCount = y.count - y.cashCount;
                const isCurrentYear = y.year === now.getFullYear();
                return (
                  <div key={y.year} className="flex items-center gap-3">
                    <span className={"text-sm font-semibold w-10 tabular-nums " + (isCurrentYear ? "text-[#F6A11C]" : "text-zinc-400")}>{y.year}</span>
                    <div className="flex-1 h-7 bg-white/[0.03] rounded-md overflow-hidden flex">
                      {y.cashCount > 0 && (
                        <div
                          className="h-full bg-emerald-500/30 flex items-center justify-center"
                          style={{ width: `${(y.cashCount / y.count) * 100}%` }}
                        >
                          <span className="text-[10px] font-mono font-semibold text-emerald-400 whitespace-nowrap">{y.cashCount}</span>
                        </div>
                      )}
                      {invoiceCount > 0 && (
                        <div
                          className="h-full bg-blue-500/30 flex items-center justify-center"
                          style={{ width: `${(invoiceCount / y.count) * 100}%` }}
                        >
                          <span className="text-[10px] font-mono font-semibold text-blue-400 whitespace-nowrap">{invoiceCount}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 w-20 text-right tabular-nums font-mono">
                      {y.cashPercent}% Bar
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Durchschnittl. Umsatz pro Auftrag */}
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.04] shadow-lg shadow-black/30 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-4">&Oslash; Umsatz pro Auftrag</h3>
            <div className="space-y-2.5">
              {(() => {
                const maxAvg = Math.max(...yearlyData.map((d) => d.avgRevenue), 1);
                return yearlyData.map((y) => {
                  const widthPercent = (y.avgRevenue / maxAvg) * 100;
                  const isCurrentYear = y.year === now.getFullYear();
                  const prev = yearlyData.find((d) => d.year === y.year - 1);
                  const change = prev && prev.avgRevenue > 0
                    ? Math.round(((y.avgRevenue - prev.avgRevenue) / prev.avgRevenue) * 100) : null;
                  return (
                    <div key={y.year} className="flex items-center gap-3">
                      <span className={"text-sm font-semibold w-10 tabular-nums " + (isCurrentYear ? "text-[#F6A11C]" : "text-zinc-400")}>{y.year}</span>
                      <div className="flex-1 h-7 bg-white/[0.03] rounded-md overflow-hidden">
                        <div
                          className={"h-full rounded-md flex items-center px-2 " + (isCurrentYear ? "bg-purple-500/30" : "bg-zinc-700/50")}
                          style={{ width: `${Math.max(widthPercent, 3)}%` }}
                        >
                          <span className={"text-[11px] font-mono font-semibold tabular-nums whitespace-nowrap " + (isCurrentYear ? "text-purple-400" : "text-zinc-300")}>
                            {y.avgRevenue}&nbsp;&euro;
                          </span>
                        </div>
                      </div>
                      {change !== null && (
                        <span className={"text-[11px] font-semibold w-12 text-right " + (change >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {change >= 0 ? "+" : ""}{change}%
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Vergütung Fahrer */}
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.04] shadow-lg shadow-black/30 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-4">Verg&uuml;tung Fahrer pro Jahr</h3>
            <div className="space-y-2.5">
              {(() => {
                const maxVal = Math.max(...yearlyData.map((d) => d.driverCosts), 1);
                return yearlyData.map((y) => {
                  const widthPercent = (y.driverCosts / maxVal) * 100;
                  const isCurrentYear = y.year === now.getFullYear();
                  const prev = yearlyData.find((d) => d.year === y.year - 1);
                  const change = prev && prev.driverCosts > 0
                    ? Math.round(((y.driverCosts - prev.driverCosts) / prev.driverCosts) * 100) : null;
                  return (
                    <div key={y.year} className="flex items-center gap-3">
                      <span className={"text-sm font-semibold w-10 tabular-nums " + (isCurrentYear ? "text-[#F6A11C]" : "text-zinc-400")}>{y.year}</span>
                      <div className="flex-1 h-7 bg-white/[0.03] rounded-md overflow-hidden">
                        <div
                          className={"h-full rounded-md flex items-center px-2 " + (isCurrentYear ? "bg-red-500/30" : "bg-zinc-700/50")}
                          style={{ width: `${Math.max(widthPercent, 3)}%` }}
                        >
                          <span className={"text-[11px] font-mono font-semibold tabular-nums whitespace-nowrap " + (isCurrentYear ? "text-red-400" : "text-zinc-300")}>
                            {(y.driverCosts / 1000).toFixed(1)}k&nbsp;&euro;
                          </span>
                        </div>
                      </div>
                      {change !== null && (
                        <span className={"text-[11px] font-semibold w-12 text-right " + (change >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {change >= 0 ? "+" : ""}{change}%
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Extras pro Jahr */}
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.04] shadow-lg shadow-black/30 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-4">Extras-Buchungen pro Jahr</h3>
            <div className="overflow-x-auto">
              {(() => {
                const filteredYears = yearlyData.filter((y) => y.year >= 2022);
                return (
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-white/[0.10]">
                        <th className="text-left py-1.5 font-semibold text-zinc-500 uppercase tracking-wider">Extra</th>
                        {filteredYears.map((y) => (
                          <th key={y.year} className={"text-right py-1.5 font-semibold tabular-nums px-1.5 " + (y.year === now.getFullYear() ? "text-[#F6A11C]" : "text-zinc-500")}>
                            {y.year}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allExtrasKeys.map((ext) => (
                        <tr key={ext} className="border-b border-white/[0.04]">
                          <td className="py-1.5 text-zinc-300 font-medium">{ext}</td>
                          {filteredYears.map((y) => {
                            const count = y.extras[ext] ?? 0;
                            const pct = y.count > 0 ? Math.round((count / y.count) * 100) : 0;
                            return (
                              <td key={y.year} className="text-right py-1.5 tabular-nums px-1.5">
                                <span className="text-zinc-300">{count}</span>
                                <span className="text-zinc-500 ml-1">({pct}%)</span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Comparison: This Year vs Last Year */}
      <div className="rounded-xl border border-white/[0.10] bg-white/[0.04] shadow-lg shadow-black/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Monatsvergleich Aufträge</h3>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#F6A11C]" />{now.getFullYear()}</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-zinc-600" />{now.getFullYear() - 1}</span>
          </div>
        </div>
        <div className="flex items-end gap-1 sm:gap-2 h-44">
          {monthCompare.map((m, i) => {
            const maxVal = Math.max(...monthCompare.map((d) => Math.max(d.thisYear, d.lastYear)), 1);
            const isCurrentMonth = i === now.getMonth();
            const isFuture = i > now.getMonth();
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 w-full h-32">
                  {/* Last year bar */}
                  <div className="flex-1 flex flex-col items-center justify-end h-full">
                    {m.lastYear > 0 && (
                      <span className="text-[9px] font-mono text-zinc-400 mb-0.5 hidden sm:block">{m.lastYear}</span>
                    )}
                    <div
                      className="w-full bg-zinc-700/50 rounded-t-sm"
                      style={{ height: `${(m.lastYear / maxVal) * 100}%`, minHeight: m.lastYear > 0 ? "4px" : "0" }}
                    />
                  </div>
                  {/* This year bar */}
                  <div className="flex-1 flex flex-col items-center justify-end h-full">
                    {m.thisYear > 0 && (
                      <span className={"text-[9px] font-mono mb-0.5 hidden sm:block " + (isCurrentMonth ? "text-[#F6A11C]" : "text-zinc-500")}>{m.thisYear}</span>
                    )}
                    <div
                      className={"w-full rounded-t-sm " + (isFuture ? "bg-[#F6A11C]/15" : isCurrentMonth ? "bg-[#F6A11C]" : "bg-[#F6A11C]/50")}
                      style={{ height: `${(m.thisYear / maxVal) * 100}%`, minHeight: m.thisYear > 0 ? "4px" : "0" }}
                    />
                  </div>
                </div>
                <span className={"text-[10px] " + (isCurrentMonth ? "text-[#F6A11C] font-semibold" : "text-zinc-400")}>{m.month}</span>
              </div>
            );
          })}
        </div>
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
      <Card className="border-white/10 bg-white/[0.04]">
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
