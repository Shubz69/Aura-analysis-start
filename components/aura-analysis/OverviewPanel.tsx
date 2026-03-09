"use client";

import { cn } from "@/lib/utils";

const METRICS = [
  { label: "Total Trades", value: "—" },
  { label: "Win Rate", value: "—", valueColor: "var(--aa-success)" },
  { label: "Average R", value: "—" },
  { label: "Total PnL", value: "—", valueColor: "var(--aa-success)" },
  { label: "Profit Factor", value: "—" },
  { label: "Average RR", value: "—" },
  { label: "Best Pair", value: "—" },
  { label: "Worst Pair", value: "—", valueColor: "var(--aa-loss)" },
];

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MOCK_DAYS = 35;

export function OverviewPanel() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className={cn(
              "rounded-xl border p-4 transition-all duration-200",
              "hover:shadow-[0_0_20px_rgba(123,92,255,0.08)] hover:scale-[1.01]"
            )}
            style={{
              background: "var(--aa-panel)",
              borderColor: "var(--aa-border)",
            }}
          >
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--aa-text-muted)" }}>
              {m.label}
            </p>
            <p className="mt-2 text-xl font-semibold" style={{ color: m.valueColor ?? "var(--aa-text)" }}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <section>
        <div
          className="rounded-xl border p-6"
          style={{
            background: "var(--aa-panel)",
            borderColor: "var(--aa-border)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold" style={{ color: "var(--aa-text)" }}>
              Monthly Performance
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <span style={{ color: "var(--aa-text-muted)" }}>MARCH 2026 — MONTHLY TOTAL</span>
              <span style={{ color: "var(--aa-success)" }}>$0.00</span>
              <span style={{ color: "var(--aa-text-muted)" }}>0 trades</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium mb-2" style={{ color: "var(--aa-text-muted)" }}>
            {DAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: MOCK_DAYS }, (_, i) => {
              const day = i + 1;
              const type = day === 8 ? "loss" : day === 9 ? "profit" : "neutral";
              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all",
                    "hover:ring-2 hover:ring-[var(--aa-accent)]"
                  )}
                  style={{
                    background: type === "loss" ? "rgba(255,90,106,0.1)" : type === "profit" ? "rgba(46,230,166,0.1)" : "var(--aa-panel-hover)",
                    border: type === "loss" ? "1px solid var(--aa-loss)" : "1px solid transparent",
                    color: type === "loss" ? "var(--aa-loss)" : type === "profit" ? "var(--aa-success)" : "var(--aa-text-muted)",
                  }}
                >
                  <span>{day}</span>
                  {type === "profit" && <span className="text-xs">+$0</span>}
                  {type === "loss" && <span className="text-xs">-$0</span>}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-center" style={{ color: "var(--aa-text-muted)" }}>
            Click a day with trades to see results. Select a day in the calendar above to view that day&apos;s performance.
          </p>
        </div>
      </section>
    </div>
  );
}
