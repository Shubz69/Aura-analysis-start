import { buildAnalyticsDatasets } from "@/lib/analytics/chartDatasets";
import { buildKpiSummary } from "@/lib/analytics/kpis";
import { maxDrawdownAbsolute } from "@/lib/analytics/drawdown";
import { longestWinStreak, longestLossStreak } from "@/lib/analytics/streaks";
import { consistencyScore } from "@/lib/analytics/consistency";
import { AnalyticsClient } from "./AnalyticsClient";
import { DEMO_EQUITY_CURVE, DEMO_PAIR_PNL, DEMO_SESSION_PNL, DEMO_TRADES } from "@/lib/demo-data";
import { BYPASS_AUTH } from "@/lib/appConfig";

const startBalance = 10000;

export default async function AnalyticsPage() {
  const tradeList = BYPASS_AUTH ? DEMO_TRADES : [];
  const hasData = tradeList.length > 0;
  const datasets = hasData ? buildAnalyticsDatasets(tradeList, startBalance) : null;
  const kpi = hasData ? buildKpiSummary(tradeList) : null;

  const equityData = hasData && datasets ? datasets.equityCurveData.map((p) => ({ date: p.date, equity: p.equity })) : DEMO_EQUITY_CURVE;
  const pairPnLData = hasData && datasets
    ? datasets.pairPerformanceData.map((p) => ({ pair: p.pair, pnl: p.totalPnL }))
    : DEMO_PAIR_PNL;
  const sessionData = hasData && datasets
    ? datasets.sessionPerformanceData
        .filter((s) => s.tradeCount > 0)
        .map((s) => ({ session: s.session, pnl: s.totalPnL }))
    : DEMO_SESSION_PNL;

  const stats = {
    totalTrades: kpi?.totalTrades ?? 0,
    winRate: kpi?.winRate ?? 0,
    avgR: kpi?.averageR ?? 0,
    totalPnL: kpi?.totalPnL ?? 0,
    profitFactor: kpi?.profitFactor ?? 0,
    expectancy: kpi?.expectancy ?? 0,
    maxDrawdown: hasData ? maxDrawdownAbsolute(tradeList, startBalance) : 0,
    maxWinStreak: hasData ? longestWinStreak(tradeList) : 0,
    maxLossStreak: hasData ? longestLossStreak(tradeList) : 0,
    avgChecklist: kpi?.averageChecklistPercent ?? 0,
    consistency: hasData ? consistencyScore(tradeList) : 0,
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
