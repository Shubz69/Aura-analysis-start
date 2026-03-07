/**
 * Dashboard KPI calculations for Aura Analysis.
 * All formulas documented; safe for empty/missing data.
 */
import type { Trade, TradeResult } from "@/types";

const RESOLVED: TradeResult[] = ["win", "loss", "breakeven"];

function resolved(trades: Trade[]): Trade[] {
  return trades.filter((t) => RESOLVED.includes(t.result));
}

function closed(trades: Trade[]): Trade[] {
  return resolved(trades);
}

export function totalTrades(trades: Trade[]): number {
  return trades.length;
}

export function openTrades(trades: Trade[]): number {
  return trades.filter((t) => t.result === "open").length;
}

export function closedTrades(trades: Trade[]): number {
  return closed(trades).length;
}

export function wins(trades: Trade[]): number {
  return closed(trades).filter((t) => t.result === "win").length;
}

export function losses(trades: Trade[]): number {
  return closed(trades).filter((t) => t.result === "loss").length;
}

export function breakevens(trades: Trade[]): number {
  return closed(trades).filter((t) => t.result === "breakeven").length;
}

export function winRate(trades: Trade[]): number {
  const c = closed(trades);
  if (c.length === 0) return 0;
  return (wins(trades) / c.length) * 100;
}

export function lossRate(trades: Trade[]): number {
  const c = closed(trades);
  if (c.length === 0) return 0;
  return (losses(trades) / c.length) * 100;
}

export function breakevenRate(trades: Trade[]): number {
  const c = closed(trades);
  if (c.length === 0) return 0;
  return (breakevens(trades) / c.length) * 100;
}

export function totalPnL(trades: Trade[]): number {
  return closed(trades).reduce((a, t) => a + t.pnl, 0);
}

export function averagePnL(trades: Trade[]): number {
  const c = closed(trades);
  if (c.length === 0) return 0;
  return totalPnL(trades) / c.length;
}

export function totalR(trades: Trade[]): number {
  return closed(trades).reduce((a, t) => a + t.r_multiple, 0);
}

export function averageR(trades: Trade[]): number {
  const c = closed(trades).filter((t) => t.result !== "breakeven");
  if (c.length === 0) return 0;
  return c.reduce((a, t) => a + t.r_multiple, 0) / c.length;
}

/** averageRR = sum(plannedRR) / totalTrades (all trades with planned RR). */
export function averageRR(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const sum = trades.reduce((a, t) => a + (t.rr ?? 0), 0);
  return sum / trades.length;
}

export function totalRiskAmount(trades: Trade[]): number {
  return closed(trades).reduce((a, t) => a + (t.risk_amount ?? 0), 0);
}

export function averageRiskPercent(trades: Trade[]): number {
  const c = closed(trades).filter((t) => t.risk_percent != null && t.risk_percent > 0);
  if (c.length === 0) return 0;
  return c.reduce((a, t) => a + t.risk_percent, 0) / c.length;
}

export function profitFactor(trades: Trade[]): number {
  const c = closed(trades);
  const grossProfit = c.filter((t) => t.pnl > 0).reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(c.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0));
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

/** Expectancy in R: (winRate * avgWinR) - (lossRate * avgLossR). */
export function expectancy(trades: Trade[]): number {
  const c = closed(trades);
  if (c.length === 0) return 0;
  const wr = winRate(trades) / 100;
  const lr = lossRate(trades) / 100;
  const winsList = c.filter((t) => t.result === "win");
  const lossesList = c.filter((t) => t.result === "loss");
  const avgWinR = winsList.length > 0 ? winsList.reduce((a, t) => a + t.r_multiple, 0) / winsList.length : 0;
  const avgLossR = lossesList.length > 0 ? Math.abs(lossesList.reduce((a, t) => a + t.r_multiple, 0) / lossesList.length) : 0;
  return wr * avgWinR - lr * avgLossR;
}

export function bestTradePnL(trades: Trade[]): number {
  const c = closed(trades);
  if (c.length === 0) return 0;
  return Math.max(...c.map((t) => t.pnl));
}

export function worstTradePnL(trades: Trade[]): number {
  const c = closed(trades);
  if (c.length === 0) return 0;
  return Math.min(...c.map((t) => t.pnl));
}

export function bestPair(trades: Trade[]): string | null {
  const byPair: Record<string, number> = {};
  closed(trades).forEach((t) => {
    byPair[t.pair] = (byPair[t.pair] ?? 0) + t.pnl;
  });
  let best: string | null = null;
  let bestPnL = -Infinity;
  for (const [pair, pnl] of Object.entries(byPair)) {
    if (pnl > bestPnL) {
      bestPnL = pnl;
      best = pair;
    }
  }
  return best;
}

export function worstPair(trades: Trade[]): string | null {
  const byPair: Record<string, number> = {};
  closed(trades).forEach((t) => {
    byPair[t.pair] = (byPair[t.pair] ?? 0) + t.pnl;
  });
  let worst: string | null = null;
  let worstPnL = Infinity;
  for (const [pair, pnl] of Object.entries(byPair)) {
    if (pnl < worstPnL) {
      worstPnL = pnl;
      worst = pair;
    }
  }
  return worst;
}

export function bestSession(trades: Trade[]): string | null {
  const bySession: Record<string, number> = {};
  closed(trades).forEach((t) => {
    const s = t.session ?? "Unknown";
    bySession[s] = (bySession[s] ?? 0) + t.pnl;
  });
  let best: string | null = null;
  let bestPnL = -Infinity;
  for (const [session, pnl] of Object.entries(bySession)) {
    if (pnl > bestPnL) {
      bestPnL = pnl;
      best = session;
    }
  }
  return best;
}

export function worstSession(trades: Trade[]): string | null {
  const bySession: Record<string, number> = {};
  closed(trades).forEach((t) => {
    const s = t.session ?? "Unknown";
    bySession[s] = (bySession[s] ?? 0) + t.pnl;
  });
  let worst: string | null = null;
  let worstPnL = Infinity;
  for (const [session, pnl] of Object.entries(bySession)) {
    if (pnl < worstPnL) {
      worstPnL = pnl;
      worst = session;
    }
  }
  return worst;
}

export function averageChecklistPercent(trades: Trade[]): number {
  const c = closed(trades).filter((t) => t.checklist_total > 0);
  if (c.length === 0) return 0;
  return c.reduce((a, t) => a + t.checklist_percent, 0) / c.length;
}

export function averageChecklistScore(trades: Trade[]): number {
  const c = closed(trades).filter((t) => t.checklist_total > 0);
  if (c.length === 0) return 0;
  return c.reduce((a, t) => a + t.checklist_score, 0) / c.length;
}

/** Numeric grade: A+ = 4, A = 3, B = 2, C = 1. */
export function gradeToScore(grade: string | null): number {
  if (!grade) return 0;
  const g = grade.toUpperCase();
  if (g === "A+") return 4;
  if (g === "A") return 3;
  if (g === "B") return 2;
  if (g === "C") return 1;
  return 0;
}

export function averageTradeGradeScore(trades: Trade[]): number {
  const c = closed(trades).filter((t) => t.trade_grade);
  if (c.length === 0) return 0;
  const sum = c.reduce((a, t) => a + gradeToScore(t.trade_grade), 0);
  return sum / c.length;
}

/** Full KPI summary for overview. */
export function buildKpiSummary(trades: Trade[]) {
  const c = closed(trades);
  const safe = (n: number) => (Number.isFinite(n) ? n : 0);
  const pf = profitFactor(trades);
  return {
    totalTrades: totalTrades(trades),
    openTrades: openTrades(trades),
    closedTrades: closedTrades(trades),
    wins: wins(trades),
    losses: losses(trades),
    breakevens: breakevens(trades),
    winRate: safe(winRate(trades)),
    lossRate: safe(lossRate(trades)),
    breakevenRate: safe(breakevenRate(trades)),
    totalPnL: totalPnL(trades),
    averagePnL: safe(averagePnL(trades)),
    totalR: totalR(trades),
    averageR: safe(averageR(trades)),
    averageRR: safe(averageRR(trades)),
    totalRiskAmount: totalRiskAmount(trades),
    averageRiskPercent: safe(averageRiskPercent(trades)),
    profitFactor: pf === Infinity ? 0 : safe(pf),
    expectancy: safe(expectancy(trades)),
    bestTradePnL: c.length ? bestTradePnL(trades) : 0,
    worstTradePnL: c.length ? worstTradePnL(trades) : 0,
    bestPair: bestPair(trades),
    worstPair: worstPair(trades),
    bestSession: bestSession(trades),
    worstSession: worstSession(trades),
    averageChecklistPercent: safe(averageChecklistPercent(trades)),
    averageChecklistScore: safe(averageChecklistScore(trades)),
    averageTradeGradeScore: safe(averageTradeGradeScore(trades)),
  };
}
