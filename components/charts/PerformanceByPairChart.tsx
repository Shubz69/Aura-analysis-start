"use client";

import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrencySafe } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

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
        className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8"
        style={{ minHeight: height }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <p className="text-center text-sm font-medium text-muted-foreground">
          No pair data yet
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Close trades to see performance by pair.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/aura-analysis/calculator">Add trade</Link>
        </Button>
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
