import * as metrics from "@/lib/analytics";
import { LeaderboardClient } from "./LeaderboardClient";
import { BYPASS_AUTH } from "@/lib/appConfig";
import { DEMO_TRADES } from "@/lib/demo-data";

export default async function LeaderboardPage() {
  const rows =
    BYPASS_AUTH && DEMO_TRADES.length > 0
      ? [
          {
            id: "1",
            name: "Shubz",
            totalTrades: metrics.totalTrades(DEMO_TRADES),
            winRate: metrics.winRate(DEMO_TRADES),
            avgR: metrics.averageR(DEMO_TRADES),
            totalPnL: metrics.totalPnL(DEMO_TRADES),
            profitFactor: metrics.profitFactor(DEMO_TRADES),
            consistencyScore: metrics.consistencyScore(DEMO_TRADES),
            bestPair: metrics.bestPair(DEMO_TRADES),
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
