"use client";

import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrencySafe } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

interface EquityPoint {
  date: string;
  equity: number;
}

interface EquityCurveChartProps {
  data: EquityPoint[];
  height?: number;
}

export function EquityCurveChart({ data, height = 280 }: EquityCurveChartProps) {
  const safeData = data.map((d) => ({ ...d, equity: Number.isFinite(d.equity) ? d.equity : 0 }));
  if (!safeData.length) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8"
        style={{ minHeight: height }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <p className="text-center text-sm font-medium text-muted-foreground">
          No equity data yet
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Add trades with results to see your equity curve.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/aura-analysis/calculator">Add trade</Link>
        </Button>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={safeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrencySafe(Number(v), 0)} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          formatter={(value: number) => [formatCurrencySafe(Number(value), 0), "Equity"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="equity"
          stroke="hsl(var(--primary))"
          fill="url(#equityGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
