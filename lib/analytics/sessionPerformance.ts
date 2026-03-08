/**
 * Session performance calculations.
 */
import type { Trade } from "@/types";

const RESOLVED = ["win", "loss", "breakeven"];
const SESSIONS = ["Asian", "London", "New York", "London/NY Overlap"] as const;

function closed(trades: Trade[]): Trade[] {
  return trades.filter((t) => RESOLVED.includes(t.result));
}

export interface SessionStats {
  session: string;
  tradeCount: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number;
  totalPnL: number;
  averagePnL: number;
  totalR: number;
  averageR: number;
  profitFactor: number;
  expectancy: number;
}

function safeNum(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

export function sessionPerformance(trades: Trade[]): SessionStats[] {
  const c = closed(trades);
  const bySession = new Map<string, Trade[]>();
  for (const t of c) {
    const s = t.session ?? "Unknown";
    if (!bySession.has(s)) bySession.set(s, []);
    bySession.get(s)!.push(t);
  }
  for (const s of SESSIONS) {
    if (!bySession.has(s)) bySession.set(s, []);
  }
  const result: SessionStats[] = [];
  for (const [session, list] of Array.from(bySession.entries())) {
    if (list.length === 0) {
      result.push({
        session,
        tradeCount: 0,
        wins: 0,
        losses: 0,
        breakevens: 0,
        winRate: 0,
        totalPnL: 0,
        averagePnL: 0,
        totalR: 0,
        averageR: 0,
        profitFactor: 0,
        expectancy: 0,
      });
      continue;
    }
    const wins = list.filter((t) => t.result === "win").length;
    const losses = list.filter((t) => t.result === "loss").length;
    const breakevens = list.filter((t) => t.result === "breakeven").length;
    const totalPnL = list.reduce((a, t) => a + t.pnl, 0);
    const totalR = list.reduce((a, t) => a + t.r_multiple, 0);
    const winRate = (wins / list.length) * 100;
    const grossProfit = list.filter((t) => t.pnl > 0).reduce((a, t) => a + t.pnl, 0);
    const grossLoss = Math.abs(list.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0));
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;
    const winsList = list.filter((t) => t.result === "win");
    const lossesList = list.filter((t) => t.result === "loss");
    const avgWinR = winsList.length > 0 ? winsList.reduce((a, t) => a + t.r_multiple, 0) / winsList.length : 0;
    const avgLossR = lossesList.length > 0 ? Math.abs(lossesList.reduce((a, t) => a + t.r_multiple, 0) / lossesList.length) : 0;
    const expectancy = (wins / list.length) * avgWinR - (losses / list.length) * avgLossR;
    result.push({
      session,
      tradeCount: list.length,
      wins,
      losses,
      breakevens,
      winRate: safeNum(winRate),
      totalPnL,
      averagePnL: totalPnL / list.length,
      totalR,
      averageR: totalR / list.length,
      profitFactor: profitFactor === Infinity ? 0 : safeNum(profitFactor),
      expectancy: safeNum(expectancy),
    });
  }
  return result.sort((a, b) => b.totalPnL - a.totalPnL);
}
