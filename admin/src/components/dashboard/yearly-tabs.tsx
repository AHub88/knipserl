"use client";

import { useState } from "react";

type YearlyTabsProps = {
  yearlyData: {
    year: number;
    revenue: number;
    count: number;
    cashCount: number;
    cashPercent: number;
    avgRevenue: number;
    driverCosts: number;
    extras: Record<string, number>;
  }[];
  allExtrasKeys: string[];
  currentYear: number;
};

type TabKey = "revenue" | "orders" | "avg" | "payment" | "drivers" | "extras";

const TABS: { key: TabKey; label: string }[] = [
  { key: "revenue", label: "Umsatz" },
  { key: "orders", label: "Aufträge" },
  { key: "avg", label: "Ø Auftrag" },
  { key: "payment", label: "Bar / Rechnung" },
  { key: "drivers", label: "Fahrervergütung" },
  { key: "extras", label: "Extras" },
];

function YearBar({
  year,
  value,
  maxValue,
  label,
  isCurrentYear,
  change,
  color = "orange",
}: {
  year: number;
  value: number;
  maxValue: number;
  label: string;
  isCurrentYear: boolean;
  change: number | null;
  color?: "orange" | "blue" | "purple" | "red";
}) {
  const widthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;

  const barColors = {
    orange: isCurrentYear ? "bg-primary" : "bg-primary/25",
    blue: isCurrentYear ? "bg-blue-500" : "bg-blue-500/25",
    purple: isCurrentYear ? "bg-purple-500" : "bg-purple-500/25",
    red: isCurrentYear ? "bg-red-500" : "bg-red-500/25",
  };

  return (
    <div className="flex items-center gap-3">
      <span
        className={
          "w-14 tabular-nums shrink-0 " +
          (isCurrentYear
            ? "text-base font-bold text-primary"
            : "text-sm font-semibold text-muted-foreground")
        }
      >
        {year}
      </span>
      <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
        <div
          className={"h-full rounded-md transition-all " + barColors[color]}
          style={{ width: `${Math.max(widthPercent, 3)}%` }}
        />
      </div>
      <span
        className={
          "text-sm font-mono tabular-nums whitespace-nowrap w-24 text-right shrink-0 " +
          (isCurrentYear ? "text-primary font-bold" : "text-foreground/80 font-semibold")
        }
      >
        {label}
      </span>
      {change !== null ? (
        <span
          className={
            "text-sm font-bold w-16 text-right tabular-nums shrink-0 " +
            (change >= 0 ? "text-emerald-400" : "text-red-400")
          }
        >
          {change >= 0 ? "+" : ""}
          {change}%
        </span>
      ) : (
        <span className="w-16 shrink-0" />
      )}
    </div>
  );
}

function getChange(current: number, previous: number | undefined): number | null {
  if (previous == null || previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function YearlyComparisonTabs({ yearlyData, allExtrasKeys, currentYear }: YearlyTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("revenue");

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg shadow-black/5 dark:shadow-black/25">
      {/* Tab bar */}
      <div className="flex items-center gap-0 px-4 border-b border-border overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={
              "relative px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap " +
              (activeTab === tab.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground/80")
            }
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {activeTab === "revenue" && (
          <div className="space-y-2.5">
            {(() => {
              const maxVal = Math.max(...yearlyData.map((d) => d.revenue), 1);
              return yearlyData.map((y) => {
                const prev = yearlyData.find((d) => d.year === y.year - 1);
                return (
                  <YearBar
                    key={y.year}
                    year={y.year}
                    value={y.revenue}
                    maxValue={maxVal}
                    label={`${(y.revenue / 1000).toFixed(1)}k €`}
                    isCurrentYear={y.year === currentYear}
                    change={getChange(y.revenue, prev?.revenue)}
                    color="orange"
                  />
                );
              });
            })()}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-2.5">
            {(() => {
              const maxVal = Math.max(...yearlyData.map((d) => d.count), 1);
              return yearlyData.map((y) => {
                const prev = yearlyData.find((d) => d.year === y.year - 1);
                return (
                  <YearBar
                    key={y.year}
                    year={y.year}
                    value={y.count}
                    maxValue={maxVal}
                    label={String(y.count)}
                    isCurrentYear={y.year === currentYear}
                    change={getChange(y.count, prev?.count)}
                    color="blue"
                  />
                );
              });
            })()}
          </div>
        )}

        {activeTab === "avg" && (
          <div className="space-y-2.5">
            {(() => {
              const maxVal = Math.max(...yearlyData.map((d) => d.avgRevenue), 1);
              return yearlyData.map((y) => {
                const prev = yearlyData.find((d) => d.year === y.year - 1);
                return (
                  <YearBar
                    key={y.year}
                    year={y.year}
                    value={y.avgRevenue}
                    maxValue={maxVal}
                    label={`${y.avgRevenue} €`}
                    isCurrentYear={y.year === currentYear}
                    change={getChange(y.avgRevenue, prev?.avgRevenue)}
                    color="purple"
                  />
                );
              });
            })()}
          </div>
        )}

        {activeTab === "payment" && (
          <div>
            <div className="flex items-center gap-4 mb-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-400" />Bar</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-blue-400" />Rechnung</span>
            </div>
            <div className="space-y-2.5">
              {yearlyData.map((y) => {
                const invoiceCount = y.count - y.cashCount;
                const isCurrentYear = y.year === currentYear;
                return (
                  <div key={y.year} className="flex items-center gap-3">
                    <span
                      className={
                        "w-14 tabular-nums shrink-0 " +
                        (isCurrentYear
                          ? "text-base font-bold text-primary"
                          : "text-sm font-semibold text-muted-foreground")
                      }
                    >
                      {y.year}
                    </span>
                    <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden flex">
                      {y.cashCount > 0 && (
                        <div
                          className={
                            "h-full flex items-center justify-center " +
                            (isCurrentYear ? "bg-emerald-500" : "bg-emerald-500/40")
                          }
                          style={{ width: `${(y.cashCount / y.count) * 100}%` }}
                        >
                          <span
                            className={
                              "text-sm font-mono font-bold tabular-nums whitespace-nowrap " +
                              (isCurrentYear ? "text-black" : "text-emerald-200")
                            }
                          >
                            {y.cashCount}
                          </span>
                        </div>
                      )}
                      {invoiceCount > 0 && (
                        <div
                          className={
                            "h-full flex items-center justify-center " +
                            (isCurrentYear ? "bg-blue-500" : "bg-blue-500/40")
                          }
                          style={{ width: `${(invoiceCount / y.count) * 100}%` }}
                        >
                          <span
                            className={
                              "text-sm font-mono font-bold tabular-nums whitespace-nowrap " +
                              (isCurrentYear ? "text-black" : "text-blue-200")
                            }
                          >
                            {invoiceCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <span
                      className={
                        "text-sm w-24 text-right tabular-nums font-mono font-semibold shrink-0 " +
                        (isCurrentYear ? "text-primary" : "text-muted-foreground")
                      }
                    >
                      {y.cashPercent}% Bar
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "drivers" && (
          <div className="space-y-2.5">
            {(() => {
              const maxVal = Math.max(...yearlyData.map((d) => d.driverCosts), 1);
              return yearlyData.map((y) => {
                const prev = yearlyData.find((d) => d.year === y.year - 1);
                return (
                  <YearBar
                    key={y.year}
                    year={y.year}
                    value={y.driverCosts}
                    maxValue={maxVal}
                    label={`${(y.driverCosts / 1000).toFixed(1)}k €`}
                    isCurrentYear={y.year === currentYear}
                    change={getChange(y.driverCosts, prev?.driverCosts)}
                    color="red"
                  />
                );
              });
            })()}
          </div>
        )}

        {activeTab === "extras" && (
          <div>
            <p className="text-xs text-muted-foreground mb-3">
              Anteil in % der Auft&auml;ge je Jahr. Dunklere Zellen = h&auml;ufiger gebucht.
            </p>
            <div className="overflow-x-auto">
              {(() => {
                const filteredYears = yearlyData.filter((y) => y.year >= 2022);
                return (
                  <table className="w-full text-sm border-separate border-spacing-1">
                    <thead>
                      <tr>
                        <th className="text-left pb-2 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                          Extra
                        </th>
                        {filteredYears.map((y) => (
                          <th
                            key={y.year}
                            className={
                              "text-center pb-2 tabular-nums font-bold text-sm " +
                              (y.year === currentYear ? "text-primary" : "text-muted-foreground")
                            }
                          >
                            {y.year}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allExtrasKeys.map((ext) => (
                        <tr key={ext}>
                          <td className="py-1 pr-3 text-foreground font-medium whitespace-nowrap">{ext}</td>
                          {filteredYears.map((y) => {
                            const count = y.extras[ext] ?? 0;
                            const pct = y.count > 0 ? Math.round((count / y.count) * 100) : 0;
                            // Opacity 0.08..0.85 based on pct (0..100)
                            const opacity = pct === 0 ? 0 : 0.12 + (Math.min(pct, 100) / 100) * 0.73;
                            const textClass = pct >= 60 ? "text-black font-bold" : pct >= 30 ? "text-primary font-bold" : pct > 0 ? "text-foreground/80 font-semibold" : "text-muted-foreground/50";
                            return (
                              <td key={y.year} className="text-center p-0">
                                <div
                                  className="rounded-md py-2 px-2 tabular-nums min-w-[60px] transition-colors"
                                  style={{
                                    backgroundColor:
                                      pct === 0
                                        ? "var(--muted)"
                                        : `color-mix(in srgb, var(--primary) ${opacity * 100}%, var(--muted))`,
                                  }}
                                >
                                  <span className={textClass}>
                                    {pct > 0 ? `${pct}%` : "–"}
                                  </span>
                                  {count > 0 && (
                                    <span className="block text-[10px] opacity-60 font-mono mt-0.5">
                                      {count}&times;
                                    </span>
                                  )}
                                </div>
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
        )}
      </div>
    </div>
  );
}
