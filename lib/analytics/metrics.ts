import type { Trade, TradeResult } from "@/types";
import { calcConsistencyScore } from "@/lib/trade-calculations";

const RESOLVED_RESULTS: TradeResult[] = ["win", "loss", "breakeven"];

export function getResolvedTrades(trades: Trade[]): Trade[] {
  return trades.filter((t) => RESOLVED_RESULTS.includes(t.result));
}

export function totalTrades(trades: Trade[]): number {
  return getResolvedTrades(trades).length;
}

export function winRate(trades: Trade[]): number {
  const resolved = getResolvedTrades(trades);
  if (resolved.length === 0) return 0;
  const wins = resolved.filter((t) => t.result === "win").length;
  return (wins / resolved.length) * 100;
}

export function breakevenRate(trades: Trade[]): number {
  const resolved = getResolvedTrades(trades);
  if (resolved.length === 0) return 0;
  const be = resolved.filter((t) => t.result === "breakeven").length;
  return (be / resolved.length) * 100;
}

export function averageR(trades: Trade[]): number {
  const resolved = getResolvedTrades(trades).filter((t) => t.result !== "breakeven");
  if (resolved.length === 0) return 0;
  const sum = resolved.reduce((a, t) => a + t.r_multiple, 0);
  return sum / resolved.length;
}

export function averageRR(trades: Trade[]): number {
  const resolved = getResolvedTrades(trades);
  if (resolved.length === 0) return 0;
  const sum = resolved.reduce((a, t) => a + t.rr, 0);
  return sum / resolved.length;
}

export function totalPnL(trades: Trade[]): number {
  return getResolvedTrades(trades).reduce((a, t) => a + t.pnl, 0);
}

export function profitFactor(trades: Trade[]): number {
  const resolved = getResolvedTrades(trades);
  const grossProfit = resolved.filter((t) => t.pnl > 0).reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(resolved.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0));
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

export function expectancy(trades: Trade[]): number {
  const resolved = getResolvedTrades(trades);
  if (resolved.length === 0) return 0;
  const sumR = resolved.reduce((a, t) => a + t.r_multiple, 0);
  return sumR / resolved.length;
}

export function bestPair(trades: Trade[]): string | null {
  const byPair = pairPnL(trades);
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
  const byPair = pairPnL(trades);
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

export function pairPnL(trades: Trade[]): Record<string, number> {
  const resolved = getResolvedTrades(trades);
  const out: Record<string, number> = {};
  for (const t of resolved) {
    out[t.pair] = (out[t.pair] ?? 0) + t.pnl;
  }
  return out;
}

export function sessionPnL(trades: Trade[]): Record<string, number> {
  const resolved = getResolvedTrades(trades);
  const out: Record<string, number> = {};
  for (const t of resolved) {
    const s = t.session ?? "Unknown";
    out[s] = (out[s] ?? 0) + t.pnl;
  }
  return out;
}

export function maxDrawdown(trades: Trade[]): number {
  const resolved = getResolvedTrades(trades).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  let peak = 0;
  let maxDd = 0;
  let cum = 0;
  for (const t of resolved) {
    cum += t.pnl;
    if (cum > peak) peak = cum;
    const dd = peak - cum;
    if (dd > maxDd) maxDd = dd;
  }
  return maxDd;
}

export function longestWinStreak(trades: Trade[]): number {
  const resolved = getResolvedTrades(trades).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  let max = 0;
  let current = 0;
  for (const t of resolved) {
    if (t.result === "win") {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

export function longestLossStreak(trades: Trade[]): number {
  const resolved = getResolvedTrades(trades).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  let max = 0;
  let current = 0;
  for (const t of resolved) {
    if (t.result === "loss") {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

export function averageChecklistPercent(trades: Trade[]): number {
  const withChecklist = getResolvedTrades(trades).filter((t) => t.checklist_total > 0);
  if (withChecklist.length === 0) return 0;
  const sum = withChecklist.reduce((a, t) => a + t.checklist_percent, 0);
  return sum / withChecklist.length;
}

export function consistencyScore(trades: Trade[]): number {
  return calcConsistencyScore(
    trades.map((t) => ({
      result: t.result,
      r_multiple: t.r_multiple,
      risk_percent: t.risk_percent,
      checklist_percent: t.checklist_percent,
      created_at: t.created_at,
    }))
  );
}
