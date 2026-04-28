"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import {
  IconCheck,
  IconClipboardList,
  IconForms,
  IconLayoutGrid,
  IconMail,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalyticsBundle } from "./_queries";

type TabKey = "pageviews" | "visitors" | "events" | "funnel";

const PIE_COLORS = ["#F6A11C", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#14b8a6", "#f97316"];

const LANG_LABELS: Record<string, string> = {
  de: "Deutsch",
  en: "Englisch",
  fr: "Französisch",
  it: "Italienisch",
  es: "Spanisch",
  nl: "Niederländisch",
  pl: "Polnisch",
  ru: "Russisch",
  tr: "Türkisch",
  cs: "Tschechisch",
  hu: "Ungarisch",
  pt: "Portugiesisch",
};

const EVENT_COLORS: Record<string, string> = {
  anfrage_started: "#3b82f6",
  anfrage_submitted: "#22c55e",
  kontakt_started: "#a855f7",
  kontakt_submitted: "#22c55e",
};

function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "—";
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  return `${m}:${String(s).padStart(2, "0")} Min`;
}

function formatPathDate(d: string): string {
  // d ist YYYY-MM-DD
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  return `${parts[2]}.${parts[1]}.`;
}

function fillByDay(rows: { day: string; count: number }[], range: number): { day: string; count: number }[] {
  const map = new Map(rows.map((r) => [r.day, r.count]));
  const out: { day: string; count: number }[] = [];
  const today = new Date();
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, count: map.get(key) ?? 0 });
  }
  return out;
}

export function StatisticsView({
  data,
  initialTab,
}: {
  data: AnalyticsBundle;
  initialTab: TabKey;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabKey>(initialTab);

  const setQuery = (next: Partial<{ domain: string | null; range: number; tab: TabKey }>) => {
    const sp = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (next.domain !== undefined) {
      if (next.domain === null || next.domain === "all") sp.delete("domain");
      else sp.set("domain", next.domain);
    }
    if (next.range !== undefined) {
      if (next.range === 30) sp.delete("range");
      else sp.set("range", String(next.range));
    }
    if (next.tab !== undefined) {
      if (next.tab === "pageviews") sp.delete("tab");
      else sp.set("tab", next.tab);
    }
    router.replace(`/statistics${sp.toString() ? `?${sp.toString()}` : ""}`, { scroll: false });
  };

  const filledPv = useMemo(() => fillByDay(data.pageviewsByDay, data.range), [data]);
  const filledEv = useMemo(() => fillByDay(data.eventsByDay, data.range), [data]);

  return (
    <div className="space-y-6">
      {/* Tabs + Filters */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4 space-y-3">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            const next = v as TabKey;
            setTab(next);
            setQuery({ tab: next });
          }}
        >
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="pageviews" className="px-3 py-1.5">
              Seitenaufrufe
              <span className="ml-1.5 inline-flex items-center justify-center rounded-md bg-primary/10 px-1.5 text-[11px] font-semibold text-primary tabular-nums">
                {data.total30d.toLocaleString("de-DE")}
              </span>
            </TabsTrigger>
            <TabsTrigger value="visitors" className="px-3 py-1.5">
              Besucher
            </TabsTrigger>
            <TabsTrigger value="events" className="px-3 py-1.5">
              Ereignisse
              <span className="ml-1.5 inline-flex items-center justify-center rounded-md bg-blue-500/10 px-1.5 text-[11px] font-semibold text-blue-500 tabular-nums">
                {data.eventsRange.toLocaleString("de-DE")}
              </span>
            </TabsTrigger>
            <TabsTrigger value="funnel" className="px-3 py-1.5">
              Anfrage-Funnel
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Domain filter */}
            <div className="flex flex-wrap items-center gap-1">
              <FilterPill
                active={!data.domain}
                label="Alle Domains"
                onClick={() => setQuery({ domain: null })}
              />
              {data.domains.slice(0, 6).map((d) => (
                <FilterPill
                  key={d}
                  active={data.domain === d}
                  label={d}
                  onClick={() => setQuery({ domain: d })}
                />
              ))}
            </div>
            <div className="flex-1" />
            {/* Range picker */}
            <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5">
              {[7, 30, 90].map((r) => (
                <button
                  key={r}
                  onClick={() => setQuery({ range: r })}
                  className={
                    "h-7 px-2.5 rounded-md text-[11px] font-semibold transition-colors " +
                    (data.range === r
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground/80")
                  }
                >
                  {r} Tage
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <TabsContent value="pageviews">
              <PageviewsTab data={data} byDay={filledPv} />
            </TabsContent>
            <TabsContent value="visitors">
              <VisitorsTab data={data} />
            </TabsContent>
            <TabsContent value="events">
              <EventsTab data={data} byDay={filledEv} />
            </TabsContent>
            <TabsContent value="funnel">
              <FunnelTab data={data} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// ── Filter-Pill ────────────────────────────────────────────────────────────

function FilterPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors border " +
        (active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}

// ── KPI-Box ───────────────────────────────────────────────────────────────

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── Card-Wrapper ──────────────────────────────────────────────────────────

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── Tab 1: Pageviews ──────────────────────────────────────────────────────

function PageviewsTab({ data, byDay }: { data: AnalyticsBundle; byDay: { day: string; count: number }[] }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Heute" value={data.totalToday.toLocaleString("de-DE")} />
        <Kpi label="Letzte 7 Tage" value={data.total7d.toLocaleString("de-DE")} />
        <Kpi label="Unique Besucher (30 T.)" value={data.uniqueVisitors30d.toLocaleString("de-DE")} />
        <Kpi label={`Letzte ${data.range} Tage`} value={data.total30d.toLocaleString("de-DE")} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Ø Verweildauer" value={formatDuration(data.avgDurationMs)} />
        <Kpi label="Ø Scroll-Tiefe" value={`${data.avgScrollPct}%`} />
        <Kpi label="Bounce-Rate (30 T.)" value={`${data.bounceRatePct}%`} />
        <Kpi label="Bot-Aufrufe (30 T.)" value={data.botCount30d.toLocaleString("de-DE")} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Panel title={`Seitenaufrufe (letzte ${data.range} Tage)`}>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={byDay} margin={{ top: 10, right: 10, bottom: 5, left: -16 }}>
                  <defs>
                    <linearGradient id="pvgrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickFormatter={formatPathDate}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.max(0, Math.floor(byDay.length / 12) - 1)}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v) => [String(v), "Aufrufe"]}
                    labelFormatter={(l) => formatPathDate(String(l))}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.2} fill="url(#pvgrad)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <Panel title="Top Domains">
          {data.topDomains.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.topDomains}
                      dataKey="count"
                      nameKey="domain"
                      innerRadius={48}
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {data.topDomains.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs">
                {data.topDomains.map((d, i) => (
                  <div key={d.domain} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="truncate text-muted-foreground">{d.domain || "(unbekannt)"}</span>
                    <span className="ml-auto tabular-nums font-semibold text-foreground">{d.count.toLocaleString("de-DE")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title={`Top Seiten (${data.range} Tage)`}>
          {data.topPages.length === 0 ? (
            <Empty />
          ) : (
            <div className="overflow-x-auto -mx-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 pb-2 text-left font-semibold">Domain</th>
                    <th className="px-4 pb-2 text-left font-semibold">Seite</th>
                    <th className="px-4 pb-2 text-right font-semibold">Ø Zeit</th>
                    <th className="px-4 pb-2 text-right font-semibold">Ø Scroll</th>
                    <th className="px-4 pb-2 text-right font-semibold">Aufrufe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((p) => (
                    <tr key={`${p.domain}|${p.path}`} className="border-t border-border/60">
                      <td className="px-4 py-2 text-muted-foreground truncate max-w-[140px]">{p.domain}</td>
                      <td className="px-4 py-2 font-mono text-xs text-foreground truncate max-w-[260px]">{p.path}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{p.avgDurationMs ? formatDuration(p.avgDurationMs) : "—"}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{p.avgScrollPct != null ? `${p.avgScrollPct}%` : "—"}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold text-foreground">{p.count.toLocaleString("de-DE")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title={`Top Referrer (${data.range} Tage)`}>
          {data.topReferrers.length === 0 ? (
            <Empty hint="Noch keine externen Verweise im Zeitraum." />
          ) : (
            <div className="overflow-x-auto -mx-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 pb-2 text-left font-semibold">Referrer</th>
                    <th className="px-4 pb-2 text-right font-semibold">Aufrufe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topReferrers.map((r) => (
                    <tr key={r.referrer} className="border-t border-border/60">
                      <td className="px-4 py-2 text-foreground truncate max-w-[300px]">{r.referrer}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold text-foreground">{r.count.toLocaleString("de-DE")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

// ── Tab 2: Visitors ───────────────────────────────────────────────────────

function VisitorsTab({ data }: { data: AnalyticsBundle }) {
  const totalForLang = data.byLanguage.reduce((acc, r) => acc + r.count, 0);
  const totalForRes = data.byResolution.reduce((acc, r) => acc + r.count, 0);

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-5">
        <Panel title={`Geräte (${data.range} Tage)`}>
          {data.byDevice.length === 0 ? <Empty /> : <DeviceDonut rows={data.byDevice} />}
        </Panel>
        <Panel title={`Browser (${data.range} Tage)`}>
          {data.byBrowser.length === 0 ? <Empty /> : <HBar rows={data.byBrowser} color="#3b82f6" />}
        </Panel>
        <Panel title={`Betriebssystem (${data.range} Tage)`}>
          {data.byOs.length === 0 ? <Empty /> : <HBar rows={data.byOs} color="#22c55e" />}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title={`Sprachen (${data.range} Tage)`}>
          {data.byLanguage.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              {data.byLanguage.map((r) => {
                const pct = totalForLang > 0 ? (r.count / totalForLang) * 100 : 0;
                const label = LANG_LABELS[r.code] ?? (r.code === "??" ? "Unbekannt" : r.code);
                return (
                  <div key={r.code}>
                    <div className="flex items-baseline justify-between text-sm mb-1">
                      <span className="text-foreground">
                        {label} <span className="text-muted-foreground text-xs">({r.code})</span>
                      </span>
                      <span className="tabular-nums">
                        <strong className="text-foreground">{r.count.toLocaleString("de-DE")}</strong>{" "}
                        <span className="text-muted-foreground text-xs">({pct.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title={`Bildschirmauflösungen (${data.range} Tage)`}>
          {data.byResolution.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-2">
              {data.byResolution.map((r) => {
                const pct = totalForRes > 0 ? (r.count / totalForRes) * 100 : 0;
                return (
                  <div key={`${r.width}x${r.height}`}>
                    <div className="flex items-center justify-between text-sm mb-1 gap-3">
                      <span className="text-foreground tabular-nums">
                        <IconLayoutGrid className="inline-block size-3.5 mr-1 text-muted-foreground align-text-bottom" />
                        {r.width}×{r.height}
                      </span>
                      <span className="tabular-nums">
                        <strong className="text-foreground">{r.count.toLocaleString("de-DE")}</strong>{" "}
                        <span className="text-muted-foreground text-xs">({pct.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title={`UTM-Quellen (${data.range} Tage)`}>
          {data.utmSources.length === 0 ? (
            <Empty hint="Keine UTM-Daten im Zeitraum." />
          ) : (
            <div className="overflow-x-auto -mx-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 pb-2 text-left font-semibold">Quelle</th>
                    <th className="px-4 pb-2 text-right font-semibold">Besucher</th>
                    <th className="px-4 pb-2 text-right font-semibold">Aufrufe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.utmSources.map((r) => (
                    <tr key={r.source} className="border-t border-border/60">
                      <td className="px-4 py-2 text-foreground">{r.source}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{r.visitors.toLocaleString("de-DE")}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold text-foreground">{r.pageviews.toLocaleString("de-DE")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title={`UTM-Kampagnen (${data.range} Tage)`}>
          {data.utmCampaigns.length === 0 ? (
            <Empty hint="Keine UTM-Kampagnen im Zeitraum." />
          ) : (
            <div className="overflow-x-auto -mx-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 pb-2 text-left font-semibold">Kampagne</th>
                    <th className="px-4 pb-2 text-left font-semibold">Quelle</th>
                    <th className="px-4 pb-2 text-left font-semibold">Medium</th>
                    <th className="px-4 pb-2 text-right font-semibold">Besucher</th>
                    <th className="px-4 pb-2 text-right font-semibold">Aufrufe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.utmCampaigns.map((r) => (
                    <tr key={`${r.campaign}|${r.source}|${r.medium}`} className="border-t border-border/60">
                      <td className="px-4 py-2 text-foreground">{r.campaign}</td>
                      <td className="px-4 py-2 text-muted-foreground">{r.source || "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{r.medium || "—"}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{r.visitors.toLocaleString("de-DE")}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold text-foreground">{r.pageviews.toLocaleString("de-DE")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function DeviceDonut({ rows }: { rows: { name: string; count: number }[] }) {
  const labelMap: Record<string, string> = { desktop: "Desktop", mobile: "Mobile", tablet: "Tablet" };
  const total = rows.reduce((a, b) => a + b.count, 0);
  const data = rows.map((r) => ({ name: labelMap[r.name] ?? r.name, value: r.count }));

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={85}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v, n) => [String(v), String(n)]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="text-foreground font-semibold tabular-nums">{pct.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HBar({ rows, color }: { rows: { name: string; count: number }[]; color: string }) {
  const data = rows.map((r) => ({ name: r.name || "Unbekannt", value: r.count }));
  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis dataKey="name" type="category" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            cursor={{ fill: "var(--muted)" }}
          />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]}>
            <LabelList dataKey="value" position="right" fill="var(--foreground)" fontSize={11} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Tab 3: Events ─────────────────────────────────────────────────────────

function EventsTab({ data, byDay }: { data: AnalyticsBundle; byDay: { day: string; count: number }[] }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Ereignisse heute" value={data.eventsToday.toLocaleString("de-DE")} />
        <Kpi label={`Ereignisse (${data.range} T.)`} value={data.eventsRange.toLocaleString("de-DE")} />
        <Kpi label={`Anfragen (${data.range} T.)`} value={data.registrationsRange.toLocaleString("de-DE")} />
        <Kpi label={`Kontaktanfragen (${data.range} T.)`} value={data.contactsRange.toLocaleString("de-DE")} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Panel title={`Ereignisse (letzte ${data.range} Tage)`}>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDay} margin={{ top: 10, right: 10, bottom: 5, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickFormatter={formatPathDate}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.max(0, Math.floor(byDay.length / 12) - 1)}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    cursor={{ fill: "var(--muted)" }}
                    labelFormatter={(l) => formatPathDate(String(l))}
                    formatter={(v) => [String(v), "Ereignisse"]}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <Panel title={`Nach Typ (${data.range} Tage)`}>
          {data.eventsByType.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-2">
              {data.eventsByType.map((e) => (
                <div key={e.type} className="flex items-center gap-2">
                  <EventTypeBadge type={e.type} />
                  <span className="ml-auto tabular-nums font-semibold text-foreground">{e.count.toLocaleString("de-DE")}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Letzte Ereignisse">
        {data.recentEvents.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 pb-2 text-left font-semibold">Zeitpunkt</th>
                  <th className="px-4 pb-2 text-left font-semibold">Ereignis</th>
                  <th className="px-4 pb-2 text-left font-semibold">Details</th>
                  <th className="px-4 pb-2 text-left font-semibold">Pfad</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEvents.map((e) => (
                  <tr key={e.id} className="border-t border-border/60">
                    <td className="px-4 py-2 text-muted-foreground tabular-nums whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2"><EventTypeBadge type={e.type} /></td>
                    <td className="px-4 py-2 text-foreground text-xs max-w-[280px] truncate">{summarizeMeta(e.meta)}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground truncate max-w-[200px]">{e.path ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function EventTypeBadge({ type }: { type: string }) {
  const labelMap: Record<string, string> = {
    anfrage_started: "Anfrage gestartet",
    anfrage_submitted: "Anfrage gesendet",
    kontakt_started: "Kontakt gestartet",
    kontakt_submitted: "Kontakt gesendet",
  };
  const color = EVENT_COLORS[type] ?? "#94a3b8";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium"
      style={{ background: `${color}1a`, color }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {labelMap[type] ?? type}
    </span>
  );
}

function summarizeMeta(meta: unknown): string {
  if (!meta || typeof meta !== "object") return "";
  const obj = meta as Record<string, unknown>;
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    parts.push(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
  }
  return parts.slice(0, 3).join(" · ");
}

// ── Tab 4: Funnel ─────────────────────────────────────────────────────────

function FunnelTab({ data }: { data: AnalyticsBundle }) {
  return (
    <div className="space-y-6">
      <FunnelView
        title={`Anfrage-Funnel (${data.range} Tage)`}
        steps={[
          {
            icon: IconLayoutGrid,
            label: "Anfrage-Seite besucht",
            sublabel: "Pageview /termin-reservieren",
            value: data.funnelAnfrage.opened,
            color: "#3b82f6",
          },
          {
            icon: IconForms,
            label: "Anfrage gestartet",
            sublabel: "Erstes Formular-Feld berührt",
            value: data.funnelAnfrage.started,
            color: "#a855f7",
          },
          {
            icon: IconCheck,
            label: "Anfrage gesendet",
            sublabel: "Erfolgreich abgesendet",
            value: data.funnelAnfrage.submitted,
            color: "#22c55e",
          },
        ]}
      />

      <FunnelView
        title={`Kontakt-Funnel (${data.range} Tage)`}
        steps={[
          {
            icon: IconMessageCircle,
            label: "Kontaktseite besucht",
            sublabel: "Pageview /kontakt",
            value: data.funnelKontakt.opened,
            color: "#3b82f6",
          },
          {
            icon: IconClipboardList,
            label: "Kontakt gestartet",
            sublabel: "Erstes Formular-Feld berührt",
            value: data.funnelKontakt.started,
            color: "#a855f7",
          },
          {
            icon: IconMail,
            label: "Kontakt gesendet",
            sublabel: "Erfolgreich abgesendet",
            value: data.funnelKontakt.submitted,
            color: "#22c55e",
          },
        ]}
      />
    </div>
  );
}

function FunnelView({
  title,
  steps,
}: {
  title: string;
  steps: { icon: React.ComponentType<{ className?: string }>; label: string; sublabel: string; value: number; color: string }[];
}) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  const totalConversion = steps[0].value > 0 ? (steps[steps.length - 1].value / steps[0].value) * 100 : 0;

  return (
    <Panel title={title}>
      <div className="space-y-4">
        {steps.map((s, i) => {
          const widthPct = max > 0 ? (s.value / max) * 100 : 0;
          const prev = i > 0 ? steps[i - 1].value : null;
          const conv = prev && prev > 0 ? (s.value / prev) * 100 : null;
          const Icon = s.icon;

          return (
            <div key={s.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="size-4 shrink-0" style={{ color: s.color }} />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{s.sublabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-right">
                  {conv != null && (
                    <span className="text-xs tabular-nums" style={{ color: conv >= 50 ? "#22c55e" : conv >= 20 ? "#f59e0b" : "#ef4444" }}>
                      {conv.toFixed(1)}% Conversion
                    </span>
                  )}
                  <span className="font-bold text-2xl tabular-nums text-foreground">{s.value.toLocaleString("de-DE")}</span>
                </div>
              </div>
              <div className="h-3 rounded-md bg-muted overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${widthPct}%`, background: s.color }} />
              </div>
            </div>
          );
        })}

        <div className="border-t border-border pt-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Gesamte Conversion-Rate</span>
          <span
            className="text-base font-bold tabular-nums"
            style={{ color: totalConversion >= 10 ? "#22c55e" : totalConversion >= 3 ? "#f59e0b" : "#ef4444" }}
          >
            {totalConversion.toFixed(1)}%
          </span>
        </div>
      </div>
    </Panel>
  );
}

// ── Empty-State ───────────────────────────────────────────────────────────

function Empty({ hint }: { hint?: string }) {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">
      {hint ?? "Noch keine Daten im gewählten Zeitraum."}
    </p>
  );
}

