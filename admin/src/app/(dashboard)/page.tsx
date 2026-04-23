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
import { YearlyComparisonTabs } from "@/components/dashboard/yearly-tabs";

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
      bgClass: "bg-primary/10",
      iconClass: "text-primary",
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Willkommen zur&uuml;ck, {session?.user?.name}
        </p>
      </div>

      {/* ── Standpunkt heute + KPIs side by side ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Standpunkt heute - takes 2 cols */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-lg shadow-black/5 dark:shadow-black/25 p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Standpunkt heute ({ytdDateLabel})
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            Wie standen wir jeweils am {ytdDateLabel}?
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Umsatz bis {ytdDateLabel}</p>
              <div className="space-y-2">
                {(() => {
                  const maxRev = Math.max(...ytdYears.map((y) => y.revenue), 1);
                  return ytdYears.map((y, i) => {
                    const isCurrentYear = y.year === now.getFullYear();
                    const prev = i > 0 ? ytdYears[i - 1] : null;
                    const change = prev && prev.revenue > 0 ? Math.round(((y.revenue - prev.revenue) / prev.revenue) * 100) : null;
                    return (
                      <div key={y.year} className="flex items-center gap-3">
                        <span className={"text-sm font-semibold w-10 tabular-nums " + (isCurrentYear ? "text-primary" : "text-muted-foreground")}>{y.year}</span>
                        <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                          <div className={"h-full rounded-md flex items-center px-2.5 " + (isCurrentYear ? "bg-primary/30" : "bg-accent")} style={{ width: `${Math.max((y.revenue / maxRev) * 100, 5)}%` }}>
                            <span className={"text-[11px] font-mono font-bold tabular-nums whitespace-nowrap " + (isCurrentYear ? "text-primary" : "text-foreground/80")}>{y.revenue.toLocaleString("de-DE", { minimumFractionDigits: 0 })}&nbsp;&euro;</span>
                          </div>
                        </div>
                        <span className={"text-[11px] font-semibold w-12 text-right " + (change === null ? "text-muted-foreground" : change >= 0 ? "text-emerald-400" : "text-red-400")}>{change === null ? "\u2013" : `${change >= 0 ? "+" : ""}${change}%`}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Aufträge bis {ytdDateLabel}</p>
              <div className="space-y-2">
                {(() => {
                  const maxCount = Math.max(...ytdYears.map((y) => y.count), 1);
                  return ytdYears.map((y, i) => {
                    const isCurrentYear = y.year === now.getFullYear();
                    const prev = i > 0 ? ytdYears[i - 1] : null;
                    const change = prev && prev.count > 0 ? Math.round(((y.count - prev.count) / prev.count) * 100) : null;
                    return (
                      <div key={y.year} className="flex items-center gap-3">
                        <span className={"text-sm font-semibold w-10 tabular-nums " + (isCurrentYear ? "text-primary" : "text-muted-foreground")}>{y.year}</span>
                        <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                          <div className={"h-full rounded-md flex items-center px-2.5 " + (isCurrentYear ? "bg-blue-500/30" : "bg-accent")} style={{ width: `${Math.max((y.count / maxCount) * 100, 5)}%` }}>
                            <span className={"text-[11px] font-mono font-bold tabular-nums " + (isCurrentYear ? "text-blue-400" : "text-foreground/80")}>{y.count}</span>
                          </div>
                        </div>
                        <span className={"text-[11px] font-semibold w-12 text-right " + (change === null ? "text-muted-foreground" : change >= 0 ? "text-emerald-400" : "text-red-400")}>{change === null ? "\u2013" : `${change >= 0 ? "+" : ""}${change}%`}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* KPIs - compact vertical stack in right column */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5"
              >
                <div className={`flex items-center justify-center rounded-lg p-2 ${kpi.bgClass}`}>
                  <Icon className={`h-4 w-4 ${kpi.iconClass}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold tracking-tight text-foreground tabular-nums leading-tight">
                    {kpi.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {kpi.label}
                  </p>
                </div>
                <div className="ml-auto">
                  <Sparkline data={kpi.sparkline} color={kpi.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Yearly Comparison (tabbed) ── */}
      {yearlyData.length > 0 && (
        <YearlyComparisonTabs
          yearlyData={yearlyData}
          allExtrasKeys={allExtrasKeys}
          currentYear={now.getFullYear()}
        />
      )}

      {/* (old KPI grid + yearly charts replaced by above) */}

      {/* Monthly Comparison: This Year vs Last Year */}
      <div className="rounded-xl border border-border bg-card shadow-lg shadow-black/5 dark:shadow-black/25 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Monatsvergleich Aufträge</h3>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />{now.getFullYear()}</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-accent" />{now.getFullYear() - 1}</span>
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
                      <span className="text-[9px] font-mono text-muted-foreground mb-0.5 hidden sm:block">{m.lastYear}</span>
                    )}
                    <div
                      className="w-full bg-accent rounded-t-sm"
                      style={{ height: `${(m.lastYear / maxVal) * 100}%`, minHeight: m.lastYear > 0 ? "4px" : "0" }}
                    />
                  </div>
                  {/* This year bar */}
                  <div className="flex-1 flex flex-col items-center justify-end h-full">
                    {m.thisYear > 0 && (
                      <span className={"text-[9px] font-mono mb-0.5 hidden sm:block " + (isCurrentMonth ? "text-primary" : "text-muted-foreground")}>{m.thisYear}</span>
                    )}
                    <div
                      className={"w-full rounded-t-sm " + (isFuture ? "bg-primary/15" : isCurrentMonth ? "bg-primary" : "bg-primary/50")}
                      style={{ height: `${(m.thisYear / maxVal) * 100}%`, minHeight: m.thisYear > 0 ? "4px" : "0" }}
                    />
                  </div>
                </div>
                <span className={"text-[10px] " + (isCurrentMonth ? "text-primary font-semibold" : "text-muted-foreground")}>{m.month}</span>
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
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            N&auml;chste Auftr&auml;ge
          </CardTitle>
          <p className="text-sm text-muted-foreground">
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
