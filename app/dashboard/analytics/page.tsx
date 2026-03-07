import * as metrics from "@/lib/analytics";
import { buildEquityCurve } from "@/lib/analytics/equity";
import { AnalyticsClient } from "./AnalyticsClient";
import { DEMO_EQUITY_CURVE, DEMO_PAIR_PNL, DEMO_SESSION_PNL } from "@/lib/demo-data";

const emptyTrades: never[] = [];
const startBalance = 10000;

export default async function AnalyticsPage() {
  const hasData = false;
  const equityData = hasData ? buildEquityCurve(emptyTrades, startBalance) : DEMO_EQUITY_CURVE;
  const pairPnLData = hasData
    ? Object.entries(metrics.pairPnL(emptyTrades)).map(([pair, pnl]) => ({ pair, pnl }))
    : DEMO_PAIR_PNL;
  const sessionData = hasData
    ? Object.entries(metrics.sessionPnL(emptyTrades)).map(([session, pnl]) => ({ session, pnl }))
    : DEMO_SESSION_PNL;

  const stats = {
    totalTrades: metrics.totalTrades(emptyTrades),
    winRate: metrics.winRate(emptyTrades),
    avgR: metrics.averageR(emptyTrades),
    totalPnL: metrics.totalPnL(emptyTrades),
    profitFactor: metrics.profitFactor(emptyTrades),
    expectancy: metrics.expectancy(emptyTrades),
    maxDrawdown: metrics.maxDrawdown(emptyTrades),
    maxWinStreak: metrics.longestWinStreak(emptyTrades),
    maxLossStreak: metrics.longestLossStreak(emptyTrades),
    avgChecklist: metrics.averageChecklistPercent(emptyTrades),
    consistency: metrics.consistencyScore(emptyTrades),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      <AnalyticsClient
        stats={stats}
        equityData={equityData}
        pairData={pairPnLData}
        sessionData={sessionData}
        isDemo={!hasData}
      />
    </div>
  );
}
