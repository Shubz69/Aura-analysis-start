"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/dashboard/KPICard";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { PerformanceByPairChart } from "@/components/charts/PerformanceByPairChart";
import { SessionChart } from "@/components/charts/SessionChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, BarChart3, AlertCircle } from "lucide-react";
import { formatCurrencySafe, formatPercentSafe, formatRSafe, formatDate } from "@/lib/utils";
import { TradingCalendar, type CalendarTrade } from "@/components/dashboard/TradingCalendar";
import { TradeStatusBadge } from "@/components/trades/TradeStatusBadge";
import { useTradesStore } from "@/lib/store/tradesStore";
import { buildOverviewDatasets } from "@/lib/analytics/chartDatasets";
import { useEffect, useState, useMemo } from "react";

interface OverviewClientProps {
  kpis: {
    totalTrades: number;
    winRate: number;
    avgR: number;
    totalPnL: number;
    profitFactor: number;
    avgRR: number;
    bestPair: string | null;
    worstPair: string | null;
  };
  equityData: { date: string; equity: number }[];
  recentTrades: Array<{
    id: string;
    pair: string;
    direction: string;
    result: string;
    pnl: number;
    created_at: string;
  }>;
  pairData: { pair: string; pnl: number }[];
  sessionData: { session: string; pnl: number }[];
  calendarTrades: CalendarTrade[];
  isDemo?: boolean;
  error?: string | null;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export function OverviewClient({
  kpis: serverKpis,
  equityData: serverEquity,
  recentTrades: serverRecent,
  pairData: serverPairData,
  sessionData: serverSessionData,
  calendarTrades: serverCalendarTrades,
  isDemo: serverIsDemo = false,
  error,
}: OverviewClientProps) {
  const router = useRouter();
  const localTrades = useTradesStore(state => state.trades);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    kpis,
    equityData,
    recentTrades,
    pairData,
    sessionData,
    calendarTrades,
    isDemo,
  } = useMemo(() => {
    // If the server provided real trades (not demo), use them primarily
    if (!serverIsDemo) {
      return {
        kpis: serverKpis,
        equityData: serverEquity,
        recentTrades: serverRecent,
        pairData: serverPairData,
        sessionData: serverSessionData,
        calendarTrades: serverCalendarTrades,
        isDemo: false,
      };
    }

    // If server sent demo data but we have local trades, recalculate from local!
    if (mounted && localTrades && localTrades.length > 0) {
      const datasets = buildOverviewDatasets(localTrades, 10000);
      
      const newKpis = {
        totalTrades: datasets.kpiSummary.totalTrades,
        winRate: datasets.kpiSummary.winRate,
        avgR: datasets.kpiSummary.averageR,
        totalPnL: datasets.kpiSummary.totalPnL,
        profitFactor: datasets.kpiSummary.profitFactor,
        avgRR: datasets.kpiSummary.averageRR,
        bestPair: datasets.kpiSummary.bestPair,
        worstPair: datasets.kpiSummary.worstPair,
      };

      const newCalendarTrades = localTrades.map((t) => ({
        date: new Date(t.created_at).toISOString().slice(0, 10),
        result: t.result as "win" | "loss" | "breakeven" | "open",
        pnl: Number(t.pnl) || 0,
        id: String(t.id),
      }));
      
      return {
        kpis: newKpis,
        equityData: datasets.equityCurveData,
        recentTrades: datasets.recentTrades,
        pairData: datasets.pairPerformanceTop5.map((p) => ({ pair: p.pair, pnl: p.totalPnL })),
        sessionData: datasets.sessionPerformanceData.filter((s) => s.tradeCount > 0).map((s) => ({ session: s.session, pnl: s.totalPnL })),
        calendarTrades: newCalendarTrades,
        isDemo: false,
      };
    }

    // Default to server demo data
    return {
      kpis: serverKpis,
      equityData: serverEquity,
      recentTrades: serverRecent,
      pairData: serverPairData,
      sessionData: serverSessionData,
      calendarTrades: serverCalendarTrades,
      isDemo: true,
    };
  }, [mounted, localTrades, serverIsDemo, serverKpis, serverEquity, serverRecent, serverPairData, serverSessionData, serverCalendarTrades]);

  const displayKpis = isDemo
    ? {
        ...kpis,
        totalTrades: 0,
        winRate: 0,
        avgR: 0,
        totalPnL: 0,
        profitFactor: 0,
        avgRR: 0,
        bestPair: null as string | null,
        worstPair: null as string | null,
      }
    : kpis;

  return (
    <motion.div
      className="space-y-8 sm:space-y-10"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {isDemo && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
          <BarChart3 className="h-5 w-5 shrink-0 text-primary" />
          <span>Showing sample data. Add trades to see your real performance.</span>
          <Button asChild size="sm" className="ml-auto shrink-0">
            <Link href="/aura-analysis/calculator">Add trade</Link>
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your trading performance at a glance</p>
        </div>
        <Button asChild className="w-full sm:w-auto shadow-sm">
          <Link href="/aura-analysis/calculator">
            <Plus className="mr-2 h-4 w-4" />
            Quick add trade
          </Link>
        </Button>
      </div>

      <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KPICard title="Total Trades" value={displayKpis.totalTrades} />
        <KPICard
          title="Win Rate"
          value={displayKpis.totalTrades ? formatPercentSafe(displayKpis.winRate) : "—"}
          trend={displayKpis.winRate >= 50 ? "up" : "down"}
        />
        <KPICard
          title="Average R"
          value={displayKpis.totalTrades ? formatRSafe(displayKpis.avgR) : "—"}
        />
        <KPICard
          title="Total PnL"
          value={formatCurrencySafe(displayKpis.totalPnL)}
          trend={displayKpis.totalPnL >= 0 ? "up" : "down"}
        />
      </motion.div>

      <motion.div variants={item} className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Profit Factor"
          value={displayKpis.totalTrades ? (Number.isFinite(displayKpis.profitFactor) && displayKpis.profitFactor > 0 ? displayKpis.profitFactor.toFixed(2) : "—") : "—"}
        />
        <KPICard title="Average RR" value={displayKpis.totalTrades ? formatRSafe(displayKpis.avgRR) : "—"} />
        <KPICard title="Best Pair" value={displayKpis.bestPair ?? "—"} />
        <KPICard title="Worst Pair" value={displayKpis.worstPair ?? "—"} />
      </motion.div>

      <motion.div variants={item}>
        <TradingCalendar trades={calendarTrades} />
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-border/80 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Equity Curve</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[240px] sm:min-h-[280px]">
            <EquityCurveChart data={equityData} height={260} />
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-border/80 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Performance by Pair</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[240px] sm:min-h-[280px]">
            <PerformanceByPairChart data={pairData.slice(0, 8)} height={260} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-border/80 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Performance by Session</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[200px] sm:min-h-[240px]">
            <SessionChart data={sessionData} height={220} />
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-border/80 bg-card shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Trades</CardTitle>
            <Link href="/aura-analysis/journal" className="shrink-0">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTrades.length === 0 && !isDemo ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center">
                <p className="text-sm font-medium text-muted-foreground">No trades yet</p>
                <p className="text-xs text-muted-foreground">Add your first trade to see it here</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/aura-analysis/calculator">Add your first trade</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Pair</TableHead>
                      <TableHead className="hidden sm:table-cell">Dir</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead className="text-right">PnL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTrades.map((t) => (
                      <TableRow
                        key={t.id}
                        className="cursor-pointer"
                        onClick={() => !t.id.startsWith("demo") && router.push(`/aura-analysis/journal?trade=${t.id}`)}
                      >
                        <TableCell className="text-muted-foreground text-xs sm:text-sm">
                          {formatDate(t.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">{t.pair}</TableCell>
                        <TableCell className="hidden sm:table-cell">{t.direction}</TableCell>
                        <TableCell>
                          <TradeStatusBadge status={t.result} />
                        </TableCell>
                        <TableCell className={`text-right font-medium ${t.result === "open" ? "text-muted-foreground" : t.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {t.result === "open" ? "—" : formatCurrencySafe(t.pnl)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
