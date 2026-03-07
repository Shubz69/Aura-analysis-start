"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrencySafe } from "@/lib/utils";

interface PairPoint {
  pair: string;
  pnl: number;
}

interface PerformanceByPairChartProps {
  data: PairPoint[];
  height?: number;
}

export function PerformanceByPairChart({ data, height = 280 }: PerformanceByPairChartProps) {
  const safeData = data.map((d) => ({ ...d, pnl: Number.isFinite(d.pnl) ? d.pnl : 0 }));
  if (!safeData.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-border bg-card/30 text-muted-foreground text-sm"
        style={{ height }}
      >
        No pair data yet.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={safeData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrencySafe(Number(v), 0)} />
        <YAxis type="category" dataKey="pair" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={55} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          formatter={(value: number) => [formatCurrencySafe(Number(value), 0), "PnL"]}
        />
        <Bar dataKey="pnl" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
