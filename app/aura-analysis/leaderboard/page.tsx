import { headers, cookies } from "next/headers";
import { buildKpiSummary } from "@/lib/analytics/kpis";
import { consistencyScore } from "@/lib/analytics/consistency";
import { LeaderboardClient } from "./LeaderboardClient";
import { getCurrentUserFromToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { getTradesByUserId } from "@/lib/data/trades";
import type { Trade } from "@/types";

export default async function LeaderboardPage() {
  let rows: { id: string; name: string; totalTrades: number; winRate: number; avgR: number; totalPnL: number; profitFactor: number; consistencyScore: number; bestPair: string | null }[] = [];
  try {
    const h = await headers();
    const c = await cookies();
    const token = c.get("token")?.value;
    const req = { headers: { authorization: h.get("authorization") ?? (token ? `Bearer ${token}` : null) }, cookies: { token } };
    const db = { query };
    const user = await getCurrentUserFromToken(req, db);
    if (user) {
      const tradeList = (await getTradesByUserId(user.id)) as Trade[];
      if (tradeList.length > 0) {
        const kpi = buildKpiSummary(tradeList);
        rows = [
          {
            id: user.id,
            name: user.username ?? user.email ?? "You",
            totalTrades: kpi.totalTrades,
            winRate: kpi.winRate,
            avgR: kpi.averageR,
            totalPnL: kpi.totalPnL,
            profitFactor: Number.isFinite(kpi.profitFactor) ? kpi.profitFactor : 0,
            consistencyScore: consistencyScore(tradeList),
            bestPair: kpi.bestPair,
          },
        ];
      }
    }
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
      <LeaderboardClient rows={rows} isAdmin={false} />
    </div>
  );
}
