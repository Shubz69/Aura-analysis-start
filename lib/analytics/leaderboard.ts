/**
 * Leaderboard: per-user metrics and ranking.
 */
import type { Trade } from "@/types";
import { buildKpiSummary } from "./kpis";
import { consistencyScore } from "./consistency";
import { pairPerformance, mostTradedPair } from "./pairPerformance";

export interface LeaderboardUser {
  userId: string;
  totalTrades: number;
  closedTrades: number;
  winRate: number;
  totalPnL: number;
  averagePnL: number;
  totalR: number;
  averageR: number;
  averageRR: number;
  profitFactor: number;
  expectancy: number;
  consistencyScore: number;
  bestPair: string | null;
  mostTradedPair: string | null;
  averageChecklistPercent: number;
}

export type LeaderboardSortKey =
  | "totalPnL"
  | "averageR"
  | "winRate"
  | "consistencyScore"
  | "profitFactor"
  | "totalTrades";

function safeNum(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

export function leaderboardFromTradesByUser(
  tradesByUser: Map<string, Trade[]>,
  sortBy: LeaderboardSortKey = "totalPnL"
): LeaderboardUser[] {
  const users: LeaderboardUser[] = [];
  for (const [userId, trades] of tradesByUser) {
    const kpi = buildKpiSummary(trades);
    const pairs = pairPerformance(trades);
    const bestP = pairs.length ? pairs[0].pair : null;
    const mostP = mostTradedPair(trades);
    const pf = kpi.profitFactor;
    users.push({
      userId,
      totalTrades: kpi.totalTrades,
      closedTrades: kpi.closedTrades,
      winRate: safeNum(kpi.winRate),
      totalPnL: kpi.totalPnL,
      averagePnL: safeNum(kpi.averagePnL),
      totalR: kpi.totalR,
      averageR: safeNum(kpi.averageR),
      averageRR: safeNum(kpi.averageRR),
      profitFactor: pf === Infinity ? 0 : safeNum(pf),
      expectancy: safeNum(kpi.expectancy),
      consistencyScore: consistencyScore(trades),
      bestPair: kpi.bestPair ?? bestP,
      mostTradedPair: mostP,
      averageChecklistPercent: safeNum(kpi.averageChecklistPercent),
    });
  }
  users.sort((a, b) => {
    const va = (a as Record<string, number>)[sortBy] ?? 0;
    const vb = (b as Record<string, number>)[sortBy] ?? 0;
    return vb - va; // descending: higher first
  });
  return users;
}
