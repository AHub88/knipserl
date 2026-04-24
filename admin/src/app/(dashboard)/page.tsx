import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPaymentFilter } from "@/lib/view-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconInbox,
  IconFileText,
  IconCalendarEvent,
  IconCurrencyEuro,
  IconChartBar,
} from "@tabler/icons-react";
import {
  MonthlyOrdersChart,
  EventTypesPieChart,
  UpcomingOrdersList,
  YtdTrendChart,
} from "@/components/dashboard/charts";
import { YearlyComparisonTabs } from "@/components/dashboard/yearly-tabs";

export default async function DashboardPage() {
  const session = await auth();
  const paymentFilter = await getPaymentFilter(session?.user?.role ?? "");

  const now = new Date();

  const [
    openInquiries,
    openOrders,
    openRevenueAgg,
    openRevenueCashAgg,
    recentOrders,
    monthlyOrderCounts,
    eventTypeCounts,
  ] = await Promise.all([
    // KPI 1: offene Anfragen (noch keine finale Entscheidung)
    prisma.inquiry.count({
      where: { status: { in: ["NEW", "CONTACTED", "WAITING"] } },
    }),

    // KPI 2: offene Aufträge
    prisma.order.count({
      where: {
        status: { in: ["OPEN", "ASSIGNED"] },
        ...paymentFilter,
      },
    }),

    // KPI 3: offener Umsatz (Summe aller offenen Aufträge)
    prisma.order.aggregate({
      _sum: { price: true },
      where: {
        status: { in: ["OPEN", "ASSIGNED"] },
        ...paymentFilter,
      },
    }),

    // KPI 4: offener Umsatz bar
    prisma.order.aggregate({
      _sum: { price: true },
      where: {
        status: { in: ["OPEN", "ASSIGNED"] },
        paymentMethod: "CASH",
        ...paymentFilter,
      },
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

  // YTD comparison: all years at same date cutoff (Balken = last 4, Chart = alle verfügbar)
  const ytdDateLabel = now.toLocaleDateString("de-DE", { day: "2-digit", month: "long" });
  const ytdByYear = new Map<number, { revenue: number; count: number }>();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  for (const o of allOrders) {
    const d = new Date(o.eventDate);
    const year = d.getFullYear();
    const cutoff = new Date(year, currentMonth, currentDay, 23, 59, 59);
    if (d <= cutoff) {
      const existing = ytdByYear.get(year) ?? { revenue: 0, count: 0 };
      existing.revenue += o.price;
      existing.count++;
      ytdByYear.set(year, existing);
    }
  }
  const allYtdYears = [...ytdByYear.entries()]
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => a.year - b.year);
  const ytdYears = allYtdYears.slice(-4);

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

  const openRevenue = openRevenueAgg._sum.price ?? 0;
  const openRevenueCash = openRevenueCashAgg._sum.price ?? 0;
  const fmtEuro = (v: number) =>
    `${v.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`;

  // KPI card definitions (flach, oben auf Dashboard)
  const kpiCards = [
    {
      label: "Offene Anfragen",
      value: String(openInquiries),
      icon: IconInbox,
      iconClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      label: "Offene Auftr\u00e4ge",
      value: String(openOrders),
      icon: IconFileText,
      iconClass: "text-blue-400",
      bgClass: "bg-blue-500/10",
    },
    {
      label: "Offener Umsatz",
      value: fmtEuro(openRevenue),
      icon: IconCurrencyEuro,
      iconClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
    },
    {
      label: "Offener Umsatz bar",
      value: fmtEuro(openRevenueCash),
      icon: IconCurrencyEuro,
      iconClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
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

      {/* Flache KPI-Boxen ganz oben */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className={`flex items-center justify-center rounded-md p-2 ${kpi.bgClass}`}>
                <Icon className={`h-4 w-4 ${kpi.iconClass}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">
                  {kpi.label}
                </p>
                <p className="text-lg font-bold tracking-tight text-foreground tabular-nums leading-tight">
                  {kpi.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verlauf Standpunkt */}
      <YtdTrendChart ytdYears={allYtdYears} ytdDateLabel={ytdDateLabel} />

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
      <div className="rounded-xl border border-border bg-card shadow-lg shadow-black/5 dark:shadow-black/25 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <IconChartBar className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Monatsvergleich Aufträge</h3>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-muted-foreground/40" /><span className="text-muted-foreground">{now.getFullYear() - 1}</span></span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary" /><span className="font-semibold text-foreground">{now.getFullYear()}</span></span>
          </div>
        </div>
        <div className="p-5">
        <div className="flex items-end gap-1 sm:gap-2 h-48">
          {monthCompare.map((m, i) => {
            const maxVal = Math.max(...monthCompare.map((d) => Math.max(d.thisYear, d.lastYear)), 1);
            const isCurrentMonth = i === now.getMonth();
            const lastYearShort = `'${String((now.getFullYear() - 1) % 100).padStart(2, "0")}`;
            const thisYearShort = `'${String(now.getFullYear() % 100).padStart(2, "0")}`;
            return (
              <div key={m.month} className={"flex-1 flex flex-col items-center gap-1 rounded-md px-0.5 py-1 " + (isCurrentMonth ? "bg-primary/5 ring-1 ring-primary/30" : "")}>
                <div className="flex items-end gap-0.5 w-full h-32">
                  {/* Last year bar */}
                  <div className="flex-1 flex flex-col items-center justify-end h-full">
                    {m.lastYear > 0 && (
                      <span className="text-[9px] font-mono text-muted-foreground mb-0.5 hidden sm:block">{m.lastYear}</span>
                    )}
                    <div
                      className="w-full bg-muted-foreground/40 rounded-t-sm"
                      style={{ height: `${(m.lastYear / maxVal) * 100}%`, minHeight: m.lastYear > 0 ? "4px" : "0" }}
                    />
                  </div>
                  {/* This year bar */}
                  <div className="flex-1 flex flex-col items-center justify-end h-full">
                    {m.thisYear > 0 && (
                      <span className={"text-[9px] font-mono mb-0.5 hidden sm:block " + (isCurrentMonth ? "text-primary font-semibold" : "text-muted-foreground")}>{m.thisYear}</span>
                    )}
                    <div
                      className="w-full bg-primary rounded-t-sm"
                      style={{ height: `${(m.thisYear / maxVal) * 100}%`, minHeight: m.thisYear > 0 ? "4px" : "0" }}
                    />
                  </div>
                </div>
                {/* Jahres-Kurzform unter den Balken */}
                <div className="hidden sm:flex gap-0.5 w-full">
                  <span className="flex-1 text-center text-[9px] font-mono text-muted-foreground/70">{lastYearShort}</span>
                  <span className="flex-1 text-center text-[9px] font-mono text-primary/90">{thisYearShort}</span>
                </div>
                <span className={"text-[10px] " + (isCurrentMonth ? "text-primary font-semibold" : "text-muted-foreground")}>{m.month}</span>
              </div>
            );
          })}
        </div>
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
        <CardHeader className="border-b flex-row items-center gap-2">
          <IconCalendarEvent className="size-4 text-primary" />
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
