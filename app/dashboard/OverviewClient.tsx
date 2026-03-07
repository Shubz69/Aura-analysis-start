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
  formatCurrency: (v: number) => string;
  formatPercent: (v: number) => string;
  isDemo?: boolean;
  error?: string | null;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export function OverviewClient({
  kpis,
  equityData,
  recentTrades,
  pairData,
  sessionData,
  formatCurrency,
  formatPercent,
  isDemo = false,
  error,
}: OverviewClientProps) {
  const router = useRouter();
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
      className="space-y-6 sm:space-y-8"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {isDemo && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
          <BarChart3 className="h-4 w-4 shrink-0" />
          <span>Showing sample data. Add trades to see your real performance.</span>
          <Button asChild size="sm" className="ml-auto shrink-0">
            <Link href="/dashboard/calculator">Add trade</Link>
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Overview</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/calculator">
            <Plus className="mr-2 h-4 w-4" />
            Quick add trade
          </Link>
        </Button>
      </div>

      <motion.div variants={item} className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Trades" value={displayKpis.totalTrades} />
        <KPICard
          title="Win Rate"
          value={displayKpis.totalTrades ? formatPercent(displayKpis.winRate) : "—"}
          trend={displayKpis.winRate >= 50 ? "up" : "down"}
        />
        <KPICard
          title="Average R"
          value={displayKpis.totalTrades ? displayKpis.avgR.toFixed(2) : "—"}
        />
        <KPICard
          title="Total PnL"
          value={formatCurrency(displayKpis.totalPnL)}
          trend={displayKpis.totalPnL >= 0 ? "up" : "down"}
        />
      </motion.div>

      <motion.div variants={item} className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Profit Factor"
          value={displayKpis.totalTrades ? (displayKpis.profitFactor === Infinity ? "∞" : displayKpis.profitFactor.toFixed(2)) : "—"}
        />
        <KPICard title="Average RR" value={displayKpis.totalTrades ? displayKpis.avgRR.toFixed(2) : "—"} />
        <KPICard title="Best Pair" value={displayKpis.bestPair ?? "—"} />
        <KPICard title="Worst Pair" value={displayKpis.worstPair ?? "—"} />
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="glass overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Equity Curve</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[240px] sm:min-h-[280px]">
            <EquityCurveChart data={equityData} height={260} />
          </CardContent>
        </Card>
        <Card className="glass overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Performance by Pair</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[240px] sm:min-h-[280px]">
            <PerformanceByPairChart data={pairData.slice(0, 8)} height={260} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="glass overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Performance by Session</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[200px] sm:min-h-[240px]">
            <SessionChart data={sessionData} height={220} />
          </CardContent>
        </Card>
        <Card className="glass overflow-hidden">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2">
            <CardTitle className="text-lg">Recent Trades</CardTitle>
            <Link href="/dashboard/journal" className="shrink-0">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTrades.length === 0 && !isDemo ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-muted-foreground">No trades yet.</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/dashboard/calculator">Add your first trade</Link>
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
                        onClick={() => !t.id.startsWith("demo") && router.push(`/dashboard/journal?trade=${t.id}`)}
                      >
                        <TableCell className="text-muted-foreground text-xs sm:text-sm">
                          {new Date(t.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">{t.pair}</TableCell>
                        <TableCell className="hidden sm:table-cell">{t.direction}</TableCell>
                        <TableCell>{t.result}</TableCell>
                        <TableCell className={`text-right font-medium ${t.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {formatCurrency(t.pnl)}
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
