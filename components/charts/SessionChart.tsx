"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrencySafe } from "@/lib/utils";

interface SessionPoint {
  session: string;
  pnl: number;
}

interface SessionChartProps {
  data: SessionPoint[];
  height?: number;
}

export function SessionChart({ data, height = 240 }: SessionChartProps) {
  const safeData = data.map((d) => ({ ...d, pnl: Number.isFinite(d.pnl) ? d.pnl : 0 }));
  if (!safeData.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-border bg-card/30 text-muted-foreground text-sm"
        style={{ height }}
      >
        No session data yet.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={safeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="session" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrencySafe(Number(v), 0)} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          formatter={(value: number) => [formatCurrencySafe(Number(value), 0), "PnL"]}
        />
        <Bar dataKey="pnl" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
