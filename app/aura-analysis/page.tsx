import { buildOverviewDatasets } from "@/lib/analytics/chartDatasets";
import { OverviewClient } from "./OverviewClient";
import {
  DEMO_EQUITY_CURVE,
  DEMO_PAIR_PNL,
  DEMO_SESSION_PNL,
  DEMO_RECENT_TRADES,
  DEMO_TRADES,
} from "@/lib/demo-data";
import { BYPASS_AUTH } from "@/lib/appConfig";

export default async function DashboardOverviewPage() {
  const tradeList = BYPASS_AUTH ? DEMO_TRADES : [];
  const hasData = tradeList.length > 0;
  const startBalance = 10000;

  const datasets = hasData
    ? buildOverviewDatasets(tradeList, startBalance)
    : {
        kpiSummary: {
          totalTrades: 0,
          winRate: 0,
          averageR: 0,
          totalPnL: 0,
          profitFactor: 0,
          averageRR: 0,
          bestPair: null as string | null,
          worstPair: null as string | null,
        },
        equityCurveData: DEMO_EQUITY_CURVE,
        recentTrades: DEMO_RECENT_TRADES,
        pairPerformanceTop5: [] as { pair: string; tradeCount: number; totalPnL: number; winRate: number }[],
        sessionPerformanceData: [] as { session: string; tradeCount: number; totalPnL: number; winRate: number }[],
      };

  const equityData = hasData ? datasets.equityCurveData : DEMO_EQUITY_CURVE;
  const recentTrades = hasData ? datasets.recentTrades : DEMO_RECENT_TRADES;
  const pairData = hasData
    ? datasets.pairPerformanceTop5.map((p) => ({ pair: p.pair, pnl: p.totalPnL }))
    : DEMO_PAIR_PNL;
  const sessionData = hasData
    ? datasets.sessionPerformanceData
        .filter((s) => s.tradeCount > 0)
        .map((s) => ({ session: s.session, pnl: s.totalPnL }))
    : DEMO_SESSION_PNL;

  const kpis = {
    totalTrades: datasets.kpiSummary.totalTrades,
    winRate: datasets.kpiSummary.winRate,
    avgR: datasets.kpiSummary.averageR,
    totalPnL: datasets.kpiSummary.totalPnL,
    profitFactor: datasets.kpiSummary.profitFactor,
    avgRR: datasets.kpiSummary.averageRR,
    bestPair: datasets.kpiSummary.bestPair,
    worstPair: datasets.kpiSummary.worstPair,
  };

  return (
    <OverviewClient
      kpis={kpis}
      equityData={equityData}
      recentTrades={recentTrades}
      pairData={pairData}
      sessionData={sessionData}
      isDemo={!hasData}
      error={null}
    />
  );
}
