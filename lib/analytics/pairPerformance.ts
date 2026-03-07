/**
 * Pair/symbol performance calculations.
 */
import type { Trade } from "@/types";

const RESOLVED = ["win", "loss", "breakeven"];

function closed(trades: Trade[]): Trade[] {
  return trades.filter((t) => RESOLVED.includes(t.result));
}

export interface PairStats {
  pair: string;
  tradeCount: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number;
  totalPnL: number;
  averagePnL: number;
  totalR: number;
  averageR: number;
  averageRR: number;
  profitFactor: number;
  expectancy: number;
  averageChecklistPercent: number;
  bestTrade: number;
  worstTrade: number;
}

function safeNum(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

export function pairPerformance(trades: Trade[]): PairStats[] {
  const c = closed(trades);
  const byPair = new Map<string, Trade[]>();
  for (const t of c) {
    const list = byPair.get(t.pair) ?? [];
    list.push(t);
    byPair.set(t.pair, list);
  }
  const result: PairStats[] = [];
  for (const [pair, list] of byPair) {
    const wins = list.filter((t) => t.result === "win").length;
    const losses = list.filter((t) => t.result === "loss").length;
    const breakevens = list.filter((t) => t.result === "breakeven").length;
    const totalPnL = list.reduce((a, t) => a + t.pnl, 0);
    const totalR = list.reduce((a, t) => a + t.r_multiple, 0);
    const winRate = list.length > 0 ? (wins / list.length) * 100 : 0;
    const grossProfit = list.filter((t) => t.pnl > 0).reduce((a, t) => a + t.pnl, 0);
    const grossLoss = Math.abs(list.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0));
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;
    const winsList = list.filter((t) => t.result === "win");
    const lossesList = list.filter((t) => t.result === "loss");
    const avgWinR = winsList.length > 0 ? winsList.reduce((a, t) => a + t.r_multiple, 0) / winsList.length : 0;
    const avgLossR = lossesList.length > 0 ? Math.abs(lossesList.reduce((a, t) => a + t.r_multiple, 0) / lossesList.length) : 0;
    const expectancy = (wins / list.length) * avgWinR - (losses / list.length) * avgLossR;
    const withChecklist = list.filter((t) => t.checklist_total > 0);
    const averageChecklistPercent = withChecklist.length > 0 ? withChecklist.reduce((a, t) => a + t.checklist_percent, 0) / withChecklist.length : 0;
    const pnls = list.map((t) => t.pnl);
    result.push({
      pair,
      tradeCount: list.length,
      wins,
      losses,
      breakevens,
      winRate: safeNum(winRate),
      totalPnL,
      averagePnL: list.length > 0 ? totalPnL / list.length : 0,
      totalR,
      averageR: list.length > 0 ? totalR / list.length : 0,
      averageRR: list.length > 0 ? list.reduce((a, t) => a + (t.rr ?? 0), 0) / list.length : 0,
      profitFactor: profitFactor === Infinity ? 0 : safeNum(profitFactor),
      expectancy: safeNum(expectancy),
      averageChecklistPercent: safeNum(averageChecklistPercent),
      bestTrade: pnls.length ? Math.max(...pnls) : 0,
      worstTrade: pnls.length ? Math.min(...pnls) : 0,
    });
  }
  return result.sort((a, b) => b.totalPnL - a.totalPnL);
}

export function bestPair(trades: Trade[]): string | null {
  const stats = pairPerformance(trades);
  if (stats.length === 0) return null;
  return stats[0].pair;
}

export function worstPair(trades: Trade[]): string | null {
  const stats = pairPerformance(trades);
  if (stats.length === 0) return null;
  return stats[stats.length - 1].pair;
}

export function mostTradedPair(trades: Trade[]): string | null {
  const stats = pairPerformance(trades).sort((a, b) => b.tradeCount - a.tradeCount);
  if (stats.length === 0) return null;
  return stats[0].pair;
}
