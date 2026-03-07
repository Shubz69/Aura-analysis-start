import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import * as metrics from "@/lib/analytics";
import { buildEquityCurve } from "@/lib/analytics/equity";
import { AnalyticsClient } from "./AnalyticsClient";
import { ConfigRequired } from "@/components/ConfigRequired";
import { DEMO_EQUITY_CURVE, DEMO_PAIR_PNL, DEMO_SESSION_PNL } from "@/lib/demo-data";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  if (!supabase) return <ConfigRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("default_account_balance").eq("id", user.id).single();
  const { data: trades } = await supabase.from("trades").select("*").eq("user_id", user.id).order("created_at", { ascending: true });

  const tradeList = trades ?? [];
  const hasData = tradeList.length > 0;
  const startBalance = profile?.default_account_balance ?? 10000;

  const equityData = hasData ? buildEquityCurve(tradeList, startBalance) : DEMO_EQUITY_CURVE;
  const pairPnLData = hasData
    ? Object.entries(metrics.pairPnL(tradeList)).map(([pair, pnl]) => ({ pair, pnl }))
    : DEMO_PAIR_PNL;
  const sessionData = hasData
    ? Object.entries(metrics.sessionPnL(tradeList)).map(([session, pnl]) => ({ session, pnl }))
    : DEMO_SESSION_PNL;

  const stats = {
    totalTrades: metrics.totalTrades(tradeList),
    winRate: metrics.winRate(tradeList),
    avgR: metrics.averageR(tradeList),
    totalPnL: metrics.totalPnL(tradeList),
    profitFactor: metrics.profitFactor(tradeList),
    expectancy: metrics.expectancy(tradeList),
    maxDrawdown: metrics.maxDrawdown(tradeList),
    maxWinStreak: metrics.longestWinStreak(tradeList),
    maxLossStreak: metrics.longestLossStreak(tradeList),
    avgChecklist: metrics.averageChecklistPercent(tradeList),
    consistency: metrics.consistencyScore(tradeList),
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
