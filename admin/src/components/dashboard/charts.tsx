"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconChartBar, IconChartPie, IconTrendingUp } from "@tabler/icons-react";

// --- Mini Sparkline for KPI cards ---

interface SparklineProps {
  data: number[];
  color?: string;
}

export function Sparkline({ data, color = "#F6A11C" }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const padding = 2;

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y =
        height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Monthly Orders Area Chart ---

interface MonthlyOrdersChartProps {
  data?: { month: string; orders: number }[];
}

const defaultMonthlyData = [
  { month: "Okt", orders: 18 },
  { month: "Nov", orders: 24 },
  { month: "Dez", orders: 31 },
  { month: "Jan", orders: 15 },
  { month: "Feb", orders: 22 },
  { month: "Mär", orders: 28 },
];

export function MonthlyOrdersChart({
  data = defaultMonthlyData,
}: MonthlyOrdersChartProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b flex-row items-center gap-2">
        <IconChartBar className="size-4 text-primary" />
        <CardTitle className="text-base font-semibold text-foreground">
          Auftr&auml;ge pro Monat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                  fontSize: 13,
                }}
                labelStyle={{ color: "var(--muted-foreground)" }}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                name="Aufträge"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Event Types Pie Chart ---

interface EventTypeData {
  name: string;
  value: number;
}

interface EventTypesPieChartProps {
  data?: EventTypeData[];
}

const PIE_COLORS = ["#F6A11C", "#3b82f6", "#22c55e", "#a855f7", "#ec4899"];

const defaultEventData: EventTypeData[] = [
  { name: "Hochzeit", value: 35 },
  { name: "Firmenevent", value: 25 },
  { name: "Geburtstag", value: 20 },
  { name: "Messe", value: 12 },
  { name: "Sonstiges", value: 8 },
];

export function EventTypesPieChart({
  data = defaultEventData,
}: EventTypesPieChartProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b flex-row items-center gap-2">
        <IconChartPie className="size-4 text-primary" />
        <CardTitle className="text-base font-semibold text-foreground">
          Eventarten
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-[260px] w-[260px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2">
            {data.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <span
                  className="h-3 w-3 rounded-sm shrink-0"
                  style={{
                    backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                  }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="ml-auto font-medium text-foreground tabular-nums">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Upcoming Orders List (client, for navigation) ---

interface UpcomingOrder {
  id: string;
  customerName: string;
  locationName: string;
  eventType: string;
  eventDate: string;
  status: string;
  driverName: string | null;
}

interface UpcomingOrdersListProps {
  orders: UpcomingOrder[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  OPEN: {
    label: "Offen",
    className:
      "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
  },
  ASSIGNED: {
    label: "Zugewiesen",
    className:
      "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
  },
  COMPLETED: {
    label: "Abgeschlossen",
    className:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
  },
};

export function UpcomingOrdersList({ orders }: UpcomingOrdersListProps) {
  const router = useRouter();

  if (orders.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Keine offenen Auftr&auml;ge vorhanden
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => {
        const status = statusConfig[order.status] ?? statusConfig.OPEN;
        return (
          <div
            key={order.id}
            onClick={() => router.push(`/orders/${order.id}`)}
            className="group flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.04]"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                {order.customerName}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.locationName} &middot; {order.eventType} &middot;{" "}
                {new Date(order.eventDate).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3 pl-4">
              {order.driverName ? (
                <span className="text-sm text-muted-foreground">
                  {order.driverName}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  Kein Fahrer
                </span>
              )}
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- YTD Trend Chart (Standpunkt heute als Verlaufsgraph) ---

interface YtdYearRow {
  year: number;
  revenue: number;
  count: number;
}

interface YtdChartRow extends YtdYearRow {
  revenueChange: number | null;
  countChange: number | null;
}

interface YtdTrendChartProps {
  ytdYears: YtdYearRow[];
  ytdDateLabel: string;
}

type RangeOption = 4 | 6 | 8 | "all";

// Custom 2-line label renderer: Wert + Change%
function TwoLineLabelRenderer({
  color,
  valueFormatter,
  changeKey,
}: {
  color: string;
  valueFormatter: (v: number) => string;
  changeKey: "revenueChange" | "countChange";
}) {
  // Returns a component compatible with recharts LabelList content prop
  return function LabelContent(props: unknown) {
    const p = props as {
      x?: number;
      y?: number;
      value?: number | string;
      payload?: YtdChartRow;
      index?: number;
    };
    if (p.x == null || p.y == null || p.value == null) return null;
    const change = p.payload?.[changeKey];
    const formattedValue = valueFormatter(Number(p.value));
    return (
      <g>
        <text
          x={p.x}
          y={p.y - 22}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill={color}
          style={{ paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 3 }}
        >
          {formattedValue}
        </text>
        {change != null && (
          <text
            x={p.x}
            y={p.y - 8}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill={change >= 0 ? "#22c55e" : "#ef4444"}
            style={{ paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 3 }}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </text>
        )}
      </g>
    );
  };
}

function YtdMiniArea({
  data,
  valueKey,
  changeKey,
  color,
  formatter,
}: {
  data: YtdChartRow[];
  valueKey: "revenue" | "count";
  changeKey: "revenueChange" | "countChange";
  color: string;
  formatter: (v: number) => string;
}) {
  const LabelContent = TwoLineLabelRenderer({
    color,
    valueFormatter: formatter,
    changeKey,
  });
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 40, right: 30, bottom: 10, left: 20 }}>
          <defs>
            <linearGradient id={`ytd-grad-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="year"
            tick={{ fontSize: 13, fill: "var(--muted-foreground)", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            padding={{ left: 20, right: 20 }}
          />
          <Area
            type="monotone"
            dataKey={valueKey}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#ytd-grad-${valueKey})`}
            dot={{ r: 5, fill: color, strokeWidth: 2, stroke: "var(--card)" }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          >
            <LabelList dataKey={valueKey} content={LabelContent} />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function YtdTrendChart({ ytdYears, ytdDateLabel }: YtdTrendChartProps) {
  const [range, setRange] = useState<RangeOption>(4);

  const filtered = useMemo<YtdChartRow[]>(() => {
    const slice = range === "all" ? ytdYears : ytdYears.slice(-range);
    return slice.map((y, i) => {
      const prev = i > 0 ? slice[i - 1] : null;
      return {
        ...y,
        revenueChange:
          prev && prev.revenue > 0
            ? Math.round(((y.revenue - prev.revenue) / prev.revenue) * 100)
            : null,
        countChange:
          prev && prev.count > 0
            ? Math.round(((y.count - prev.count) / prev.count) * 100)
            : null,
      };
    });
  }, [ytdYears, range]);

  const availableYears = ytdYears.length;

  const allOptions: { value: RangeOption; label: string }[] = [
    { value: 4, label: "4 Jahre" },
    { value: 6, label: "6 Jahre" },
    { value: 8, label: "8 Jahre" },
    { value: "all", label: "Alle" },
  ];
  const options = allOptions.filter(
    (o) => o.value === "all" || (o.value as number) <= availableYears
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg shadow-black/5 dark:shadow-black/25 overflow-hidden">
      <div className="border-b border-border px-5 py-3 flex items-center gap-3 flex-wrap">
        <IconTrendingUp className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Verlauf Standpunkt bis {ytdDateLabel}
        </h3>
        <div className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5">
          {options.map((o) => (
            <button
              key={String(o.value)}
              onClick={() => setRange(o.value)}
              className={
                "h-7 px-2.5 rounded-md text-[11px] font-semibold transition-colors " +
                (range === o.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground/80")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Umsatz
          </p>
          <YtdMiniArea
            data={filtered}
            valueKey="revenue"
            changeKey="revenueChange"
            color="#F6A11C"
            formatter={(v) => `${v.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`}
          />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Aufträge
          </p>
          <YtdMiniArea
            data={filtered}
            valueKey="count"
            changeKey="countChange"
            color="#3b82f6"
            formatter={(v) => String(v)}
          />
        </div>
      </div>
    </div>
  );
}
