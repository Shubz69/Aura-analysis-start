import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import * as metrics from "@/lib/analytics";
import { LeaderboardClient } from "./LeaderboardClient";
import { ConfigRequired } from "@/components/ConfigRequired";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  if (!supabase) return <ConfigRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiles } = await supabase.from("profiles").select("id, full_name, username, role");
  const { data: tradesByUser } = await supabase.from("trades").select("user_id, *");

  const byUserId = (tradesByUser ?? []).reduce<Record<string, typeof tradesByUser>>((acc, t) => {
    const id = t.user_id;
    if (!acc[id]) acc[id] = [];
    acc[id].push(t);
    return acc;
  }, {});

  type ProfileRow = { id: string; full_name: string | null; username: string | null; role: string };
  const rows = (profiles ?? [] as ProfileRow[])
    .map((p) => {
      const userTrades = byUserId[p.id] ?? [];
      const resolved = userTrades.filter((t: { result: string }) => t.result !== "open");
      if (resolved.length === 0) return null;
      return {
        id: p.id,
        name: p.full_name || p.username || "Trader",
        totalTrades: metrics.totalTrades(userTrades),
        winRate: metrics.winRate(userTrades),
        avgR: metrics.averageR(userTrades),
        totalPnL: metrics.totalPnL(userTrades),
        profitFactor: metrics.profitFactor(userTrades),
        consistencyScore: metrics.consistencyScore(userTrades),
        bestPair: metrics.bestPair(userTrades),
      };
    })
    .filter(Boolean) as Array<{
      id: string;
      name: string | null;
      totalTrades: number;
      winRate: number;
      avgR: number;
      totalPnL: number;
      profitFactor: number;
      consistencyScore: number;
      bestPair: string | null;
    }>;

  rows.sort((a, b) => b.totalPnL - a.totalPnL);

  const currentUserRole = (profiles ?? []).find((p: { id: string }) => p.id === user.id)?.role ?? "member";
  const isAdmin = currentUserRole === "admin" || currentUserRole === "super_admin";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
      <LeaderboardClient rows={rows} isAdmin={isAdmin} />
    </div>
  );
}
