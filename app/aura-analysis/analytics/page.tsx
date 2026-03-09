import { headers, cookies } from "next/headers";
import { buildAnalyticsDatasets } from "@/lib/analytics/chartDatasets";
import { buildKpiSummary } from "@/lib/analytics/kpis";
import { maxDrawdownAbsolute } from "@/lib/analytics/drawdown";
import { longestWinStreak, longestLossStreak } from "@/lib/analytics/streaks";
import { consistencyScore } from "@/lib/analytics/consistency";
import { AnalyticsClient } from "./AnalyticsClient";
import { getCurrentUserFromToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { getTradesByUserId } from "@/lib/data/trades";
import type { Trade } from "@/types";

const startBalance = 10000;

export default async function AnalyticsPage() {
  let tradeList: Trade[] = [];
  try {
    const h = await headers();
    const c = await cookies();
    const token = c.get("token")?.value;
    const req = { headers: { authorization: h.get("authorization") ?? (token ? `Bearer ${token}` : null) }, cookies: { token } };
    const db = { query };
    let user = await getCurrentUserFromToken(req, db);
    if (!user) {
      const fallback = (await query("SELECT id, email, username, role FROM users LIMIT 1", [])) as { id: number; email: string; username: string; role: string }[];
      if (fallback?.[0]) user = { id: fallback[0].id, email: fallback[0].email, username: fallback[0].username, role: fallback[0].role || "user" };
    }
    if (user) {
      const rows = await getTradesByUserId(user.id);
      tradeList = rows.map((t) => ({ ...t, id: String(t.id) })) as Trade[];
    }
  } catch {
    tradeList = [];
  }

  const hasData = tradeList.length > 0;
  const datasets = hasData ? buildAnalyticsDatasets(tradeList, startBalance) : null;
  const kpi = hasData ? buildKpiSummary(tradeList) : null;

  const equityData = hasData && datasets ? datasets.equityCurveData.map((p) => ({ date: p.date, equity: p.equity })) : [];
  const pairPnLData = hasData && datasets
    ? datasets.pairPerformanceData.map((p) => ({ pair: p.pair, pnl: p.totalPnL }))
    : [];
  const sessionData = hasData && datasets
    ? datasets.sessionPerformanceData
        .filter((s) => s.tradeCount > 0)
        .map((s) => ({ session: s.session, pnl: s.totalPnL }))
    : [];

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
