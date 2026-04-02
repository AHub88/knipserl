"use client";

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
} from "recharts";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card className="border-white/10 bg-[#1a1d27]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-zinc-100">
          Auftr&auml;ge pro Monat
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F6A11C" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F6A11C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fafafa",
                  fontSize: 13,
                }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#F6A11C"
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
    <Card className="border-white/10 bg-[#1a1d27]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-zinc-100">
          Eventarten
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
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
                    backgroundColor: "#18181b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fafafa",
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
                <span className="text-zinc-400">{entry.name}</span>
                <span className="ml-auto font-medium text-zinc-200 tabular-nums">
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
            className="group flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-[#1a1d27] p-4 transition-all hover:border-[#F6A11C]/20 hover:bg-[#F6A11C]/[0.04]"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium text-zinc-100 group-hover:text-[#F6A11C] transition-colors">
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
                <span className="text-sm text-zinc-400">
                  {order.driverName}
                </span>
              ) : (
                <span className="text-sm text-zinc-400 italic">
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
