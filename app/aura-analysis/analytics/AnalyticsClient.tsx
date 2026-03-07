"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { PerformanceByPairChart } from "@/components/charts/PerformanceByPairChart";
import { SessionChart } from "@/components/charts/SessionChart";
import { formatCurrencySafe, formatPercentSafe, formatRSafe } from "@/lib/utils";

interface AnalyticsClientProps {
  stats: {
    totalTrades: number;
    winRate: number;
    avgR: number;
    totalPnL: number;
    profitFactor: number;
    expectancy: number;
    maxDrawdown: number;
    maxWinStreak: number;
    maxLossStreak: number;
    avgChecklist: number;
    consistency: number;
  };
  equityData: { date: string; equity: number }[];
  pairData: { pair: string; pnl: number }[];
  sessionData: { session: string; pnl: number }[];
  isDemo?: boolean;
}

export function AnalyticsClient({
  stats,
  equityData,
  pairData,
  sessionData,
  isDemo = false,
}: AnalyticsClientProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {isDemo && (
        <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/30 px-4 py-2">
          Showing sample data. Add trades to see your analytics.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total trades" value={stats.totalTrades} />
        <KPICard title="Win rate" value={formatPercentSafe(stats.winRate)} trend={stats.winRate >= 50 ? "up" : "down"} />
        <KPICard title="Average R" value={formatRSafe(stats.avgR)} />
        <KPICard title="Total PnL" value={formatCurrencySafe(stats.totalPnL)} trend={stats.totalPnL >= 0 ? "up" : "down"} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Profit factor" value={Number.isFinite(stats.profitFactor) && stats.profitFactor > 0 ? stats.profitFactor.toFixed(2) : "—"} />
        <KPICard title="Expectancy (R)" value={formatRSafe(stats.expectancy)} />
        <KPICard title="Max drawdown" value={formatCurrencySafe(stats.maxDrawdown)} trend="down" />
        <KPICard title="Consistency score" value={Number.isFinite(stats.consistency) ? Math.round(stats.consistency) : "—"} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <KPICard title="Longest win streak" value={stats.maxWinStreak} />
        <KPICard title="Longest loss streak" value={stats.maxLossStreak} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <KPICard title="Avg checklist %" value={formatPercentSafe(stats.avgChecklist)} />
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Equity curve</CardTitle>
        </CardHeader>
        <CardContent>
          <EquityCurveChart data={equityData} height={320} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>PnL by pair</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceByPairChart data={pairData} height={300} />
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader>
            <CardTitle>PnL by session</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionChart data={sessionData} height={300} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
