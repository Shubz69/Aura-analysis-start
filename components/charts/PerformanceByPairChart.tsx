"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PairPoint {
  pair: string;
  pnl: number;
}

interface PerformanceByPairChartProps {
  data: PairPoint[];
  height?: number;
}

export function PerformanceByPairChart({ data, height = 280 }: PerformanceByPairChartProps) {
  if (!data.length) {
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
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
        <YAxis type="category" dataKey="pair" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={55} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          formatter={(value: number) => [formatCurrency(value), "PnL"]}
        />
        <Bar dataKey="pnl" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
