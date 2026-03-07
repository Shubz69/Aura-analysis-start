import { buildKpiSummary } from "@/lib/analytics/kpis";
import { consistencyScore } from "@/lib/analytics/consistency";
import { LeaderboardClient } from "./LeaderboardClient";
import { BYPASS_AUTH } from "@/lib/appConfig";
import { DEMO_TRADES } from "@/lib/demo-data";

export default async function LeaderboardPage() {
  const kpi = BYPASS_AUTH && DEMO_TRADES.length > 0 ? buildKpiSummary(DEMO_TRADES) : null;
  const rows =
    kpi
      ? [
          {
            id: "1",
            name: "Shubz",
            totalTrades: kpi.totalTrades,
            winRate: kpi.winRate,
            avgR: kpi.averageR,
            totalPnL: kpi.totalPnL,
            profitFactor: Number.isFinite(kpi.profitFactor) ? kpi.profitFactor : 0,
            consistencyScore: consistencyScore(DEMO_TRADES),
            bestPair: kpi.bestPair,
          },
        ]
      : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
      <LeaderboardClient rows={rows} isAdmin={BYPASS_AUTH} />
    </div>
  );
}
