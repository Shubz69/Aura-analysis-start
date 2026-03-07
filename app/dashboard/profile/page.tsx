import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import * as metrics from "@/lib/analytics";
import { ProfileClient } from "./ProfileClient";
import { ConfigRequired } from "@/components/ConfigRequired";

export default async function ProfilePage() {
  const supabase = await createClient();
  if (!supabase) return <ConfigRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: trades } = await supabase.from("trades").select("*").eq("user_id", user.id);

  const kpis = {
    totalTrades: metrics.totalTrades(trades ?? []),
    winRate: metrics.winRate(trades ?? []),
    avgR: metrics.averageR(trades ?? []),
    totalPnL: metrics.totalPnL(trades ?? []),
    bestPair: metrics.bestPair(trades ?? []),
    worstPair: metrics.worstPair(trades ?? []),
    consistencyScore: metrics.consistencyScore(trades ?? []),
    sessionPnL: metrics.sessionPnL(trades ?? []),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <ProfileClient
        profile={profile}
        email={user.email ?? undefined}
        kpis={kpis}
      />
    </div>
  );
}
