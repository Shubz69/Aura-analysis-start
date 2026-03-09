import { headers, cookies } from "next/headers";
import { buildOverviewDatasets } from "@/lib/analytics/chartDatasets";
import { OverviewClient } from "./OverviewClient";
import { getCurrentUserFromToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { getTradesByUserId } from "@/lib/data/trades";

export const dynamic = "force-dynamic";

const EMPTY_DATASETS = {
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
  equityCurveData: [] as { date: string; equity: number }[],
  recentTrades: [] as { id: string; pair: string; direction: string; result: string; pnl: number; created_at: string }[],
  pairPerformanceTop5: [] as { pair: string; tradeCount: number; totalPnL: number; winRate: number }[],
  sessionPerformanceData: [] as { session: string; tradeCount: number; totalPnL: number; winRate: number }[],
};

export default async function DashboardOverviewPage() {
  const startBalance = 10000;
  let tradeList: Awaited<ReturnType<typeof getTradesByUserId>> = [];

  try {
    const h = await headers();
    const c = await cookies();
    const token = c.get("token")?.value;
    const authHeader = h.get("authorization") ?? (token ? `Bearer ${token}` : null);
    const req = { headers: { authorization: authHeader }, cookies: { token } };
    const db = { query };
    let user = await getCurrentUserFromToken(req, db);
    if (!user) {
      const rows = (await query("SELECT id, email, username, role FROM users LIMIT 1", [])) as { id: number; email: string; username: string; role: string }[];
      if (rows?.[0]) user = { id: rows[0].id, email: rows[0].email, username: rows[0].username, role: rows[0].role || "user" };
    }
    if (user) tradeList = await getTradesByUserId(String(user.id));
  } catch {
    tradeList = [];
  }

  const hasData = tradeList.length > 0;
  const datasets = hasData
    ? buildOverviewDatasets(tradeList as Parameters<typeof buildOverviewDatasets>[0], startBalance)
    : EMPTY_DATASETS;

  const equityData = datasets.equityCurveData;
  const recentTrades = datasets.recentTrades;
  const pairData = datasets.pairPerformanceTop5.map((p) => ({ pair: p.pair, pnl: p.totalPnL }));
  const sessionData = datasets.sessionPerformanceData
    .filter((s) => s.tradeCount > 0)
    .map((s) => ({ session: s.session, pnl: s.totalPnL }));

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

  const calendarTrades = tradeList.map((t) => ({
    date: new Date(t.created_at).toISOString().slice(0, 10),
    result: t.result,
    pnl: Number(t.pnl) || 0,
    id: String(t.id),
  }));

  return (
    <OverviewClient
      kpis={kpis}
      equityData={equityData}
      recentTrades={recentTrades}
      pairData={pairData}
      sessionData={sessionData}
      calendarTrades={calendarTrades}
      isDemo={!hasData}
      error={null}
    />
  );
}
