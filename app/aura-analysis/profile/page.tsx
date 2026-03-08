import * as metrics from "@/lib/analytics";
import { consistencyScore } from "@/lib/analytics/consistency";
import { ProfileClient } from "./ProfileClient";

const emptyTrades: never[] = [];

export default async function ProfilePage() {
  const kpis = {
    totalTrades: metrics.totalTrades(emptyTrades),
    winRate: metrics.winRate(emptyTrades),
    avgR: metrics.averageR(emptyTrades),
    totalPnL: metrics.totalPnL(emptyTrades),
    bestPair: metrics.bestPair(emptyTrades),
    worstPair: metrics.worstPair(emptyTrades),
    consistencyScore: consistencyScore(emptyTrades),
    sessionPnL: metrics.sessionPnL(emptyTrades),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <ProfileClient
        profile={null}
        email={undefined}
        kpis={kpis}
      />
    </div>
  );
}
