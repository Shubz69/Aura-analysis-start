import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  totalTrades,
  winRate,
  averageR,
  totalPnL,
  profitFactor,
  averageRR,
  bestPair,
  worstPair,
  sessionPnL,
  pairPnL,
} from "@/lib/analytics";
import { buildEquityCurve } from "@/lib/analytics/equity";
import { OverviewClient } from "./OverviewClient";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { ConfigRequired } from "@/components/ConfigRequired";
import {
  DEMO_EQUITY_CURVE,
  DEMO_PAIR_PNL,
  DEMO_SESSION_PNL,
  DEMO_RECENT_TRADES,
} from "@/lib/demo-data";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  if (!supabase) return <ConfigRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: trades, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const startBalance = profile?.default_account_balance ?? 10000;
  const tradeList = trades ?? [];
  const hasData = tradeList.length > 0;

  const equityData = hasData
    ? buildEquityCurve(tradeList, startBalance)
    : DEMO_EQUITY_CURVE;
  const pairData = hasData
    ? Object.entries(pairPnL(tradeList)).map(([pair, pnl]) => ({ pair, pnl }))
    : DEMO_PAIR_PNL;
  const sessionData = hasData
    ? Object.entries(sessionPnL(tradeList)).map(([session, pnl]) => ({ session, pnl }))
    : DEMO_SESSION_PNL;
  const recentTrades = hasData ? tradeList.slice(0, 10) : DEMO_RECENT_TRADES;

  const kpis = {
    totalTrades: totalTrades(tradeList),
    winRate: winRate(tradeList),
    avgR: averageR(tradeList),
    totalPnL: totalPnL(tradeList),
    profitFactor: profitFactor(tradeList),
    avgRR: averageRR(tradeList),
    bestPair: bestPair(tradeList),
    worstPair: worstPair(tradeList),
  };

  return (
    <OverviewClient
      kpis={kpis}
      equityData={equityData}
      recentTrades={recentTrades}
      pairData={pairData}
      sessionData={sessionData}
      formatCurrency={formatCurrency}
      formatPercent={formatPercent}
      isDemo={!hasData}
      error={error?.message}
    />
  );
}
