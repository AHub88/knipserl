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
    orange: isCurrentYear ? "bg-[#F6A11C]/30" : "bg-[#222326]",
    blue: isCurrentYear ? "bg-blue-500/30" : "bg-[#222326]",
    purple: isCurrentYear ? "bg-purple-500/30" : "bg-[#222326]",
    red: isCurrentYear ? "bg-red-500/30" : "bg-[#222326]",
  };
  const textColors = {
    orange: isCurrentYear ? "text-[#F6A11C]" : "text-zinc-300",
    blue: isCurrentYear ? "text-blue-400" : "text-zinc-300",
    purple: isCurrentYear ? "text-purple-400" : "text-zinc-300",
    red: isCurrentYear ? "text-red-400" : "text-zinc-300",
  };

  return (
    <div className="flex items-center gap-3">
      <span className={"text-sm font-semibold w-10 tabular-nums " + (isCurrentYear ? "text-[#F6A11C]" : "text-zinc-400")}>
        {year}
      </span>
      <div className="flex-1 h-7 bg-[#1c1d20] rounded-md overflow-hidden">
        <div
          className={"h-full rounded-md flex items-center px-2 transition-all " + barColors[color]}
          style={{ width: `${Math.max(widthPercent, 3)}%` }}
        >
          <span className={"text-[11px] font-mono font-semibold tabular-nums whitespace-nowrap " + textColors[color]}>
            {label}
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
}

function getChange(current: number, previous: number | undefined): number | null {
  if (previous == null || previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function YearlyComparisonTabs({ yearlyData, allExtrasKeys, currentYear }: YearlyTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("revenue");

  return (
    <div className="rounded-xl border border-white/[0.10] bg-card shadow-lg shadow-black/30">
      {/* Tab bar */}
      <div className="flex items-center gap-0 px-4 border-b border-white/[0.10] overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={
              "relative px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap " +
              (activeTab === tab.key
                ? "text-[#F6A11C]"
                : "text-muted-foreground hover:text-zinc-300")
            }
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#F6A11C]" />
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
            <div className="flex items-center gap-4 mb-4 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" />Bar</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-400" />Rechnung</span>
            </div>
            <div className="space-y-2.5">
              {yearlyData.map((y) => {
                const invoiceCount = y.count - y.cashCount;
                const isCurrentYear = y.year === currentYear;
                return (
                  <div key={y.year} className="flex items-center gap-3">
                    <span className={"text-sm font-semibold w-10 tabular-nums " + (isCurrentYear ? "text-[#F6A11C]" : "text-zinc-400")}>{y.year}</span>
                    <div className="flex-1 h-7 bg-[#1c1d20] rounded-md overflow-hidden flex">
                      {y.cashCount > 0 && (
                        <div className="h-full bg-emerald-500/30 flex items-center justify-center" style={{ width: `${(y.cashCount / y.count) * 100}%` }}>
                          <span className="text-[10px] font-mono font-semibold text-emerald-400 whitespace-nowrap">{y.cashCount}</span>
                        </div>
                      )}
                      {invoiceCount > 0 && (
                        <div className="h-full bg-blue-500/30 flex items-center justify-center" style={{ width: `${(invoiceCount / y.count) * 100}%` }}>
                          <span className="text-[10px] font-mono font-semibold text-blue-400 whitespace-nowrap">{invoiceCount}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 w-20 text-right tabular-nums font-mono">{y.cashPercent}% Bar</span>
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
          <div className="overflow-x-auto">
            {(() => {
              const filteredYears = yearlyData.filter((y) => y.year >= 2022);
              return (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-white/[0.10]">
                      <th className="text-left py-1.5 font-semibold text-muted-foreground uppercase tracking-wider">Extra</th>
                      {filteredYears.map((y) => (
                        <th key={y.year} className={"text-right py-1.5 font-semibold tabular-nums px-1.5 " + (y.year === currentYear ? "text-[#F6A11C]" : "text-muted-foreground")}>
                          {y.year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allExtrasKeys.map((ext) => (
                      <tr key={ext} className="border-b border-white/[0.10]">
                        <td className="py-1.5 text-zinc-300 font-medium">{ext}</td>
                        {filteredYears.map((y) => {
                          const count = y.extras[ext] ?? 0;
                          const pct = y.count > 0 ? Math.round((count / y.count) * 100) : 0;
                          return (
                            <td key={y.year} className="text-right py-1.5 tabular-nums px-1.5">
                              <span className="text-zinc-300">{count}</span>
                              <span className="text-muted-foreground ml-1">({pct}%)</span>
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
        )}
      </div>
    </div>
  );
}
