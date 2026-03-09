"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { formatCurrencySafe, formatPercentSafe } from "@/lib/utils";
import type { Profile } from "@/types";
import { useTradesStore } from "@/lib/store/tradesStore";
import { useEffect, useState, useMemo } from "react";
import { buildKpiSummary } from "@/lib/analytics/kpis";
import { consistencyScore } from "@/lib/analytics/consistency";
import { sessionPerformance } from "@/lib/analytics/sessionPerformance";

interface ProfileClientProps {
  profile: Profile | null;
  email?: string;
  kpis: {
    totalTrades: number;
    winRate: number;
    avgR: number;
    totalPnL: number;
    bestPair: string | null;
    worstPair: string | null;
    consistencyScore: number;
    sessionPnL: Record<string, number>;
  };
}

export function ProfileClient({ profile, email, kpis: serverKpis }: ProfileClientProps) {
  const localTrades = useTradesStore(state => state.trades);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const kpis = useMemo(() => {
    if (serverKpis.totalTrades > 0) return serverKpis;
    if (mounted && localTrades.length > 0) {
      const computed = buildKpiSummary(localTrades);
      const sessionPerf = sessionPerformance(localTrades);
      const sessionPnL: Record<string, number> = {};
      sessionPerf.forEach(s => { sessionPnL[s.session] = s.totalPnL; });
      return {
        totalTrades: computed.totalTrades,
        winRate: computed.winRate,
        avgR: computed.averageR,
        totalPnL: computed.totalPnL,
        bestPair: computed.bestPair,
        worstPair: computed.worstPair,
        consistencyScore: consistencyScore(localTrades),
        sessionPnL,
      };
    }
    return serverKpis;
  }, [mounted, localTrades, serverKpis]);

  const preferredSession = Object.entries(kpis.sessionPnL).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] ?? "—";

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your profile and defaults</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Name:</span> {profile?.full_name ?? "—"}</p>
          <p><span className="text-muted-foreground">Email:</span> {email ?? "—"}</p>
          <p><span className="text-muted-foreground">Role:</span> {profile?.role ?? "member"}</p>
          <p><span className="text-muted-foreground">Default balance:</span> {profile?.default_account_balance != null ? formatCurrencySafe(profile.default_account_balance) : "—"}</p>
          <p><span className="text-muted-foreground">Default risk %:</span> {profile?.default_risk_percent != null ? `${profile.default_risk_percent}%` : "—"}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total trades" value={kpis.totalTrades} />
        <KPICard title="Win rate" value={formatPercentSafe(kpis.winRate)} trend={kpis.winRate >= 50 ? "up" : "down"} />
        <KPICard title="Average R" value={kpis.avgR.toFixed(2)} />
        <KPICard title="Total PnL" value={formatCurrencySafe(kpis.totalPnL)} trend={kpis.totalPnL >= 0 ? "up" : "down"} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Best pair" value={kpis.bestPair ?? "—"} />
        <KPICard title="Worst pair" value={kpis.worstPair ?? "—"} />
        <KPICard title="Consistency score" value={kpis.consistencyScore} />
        <KPICard title="Preferred session" value={preferredSession} />
      </div>
    </div>
  );
}
