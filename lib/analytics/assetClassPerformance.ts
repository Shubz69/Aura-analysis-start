/**
 * Asset class performance (forex, metal, commodity, energy, index, crypto).
 */
import type { Trade } from "@/types";

const RESOLVED = ["win", "loss", "breakeven"];
const CLASSES = ["forex", "metal", "metals", "commodity", "energy", "index", "indices", "crypto"] as const;

function closed(trades: Trade[]): Trade[] {
  return trades.filter((t) => RESOLVED.includes(t.result));
}

function normalizeClass(c: string): string {
  const lower = c?.toLowerCase() ?? "other";
  if (lower === "metals") return "metal";
  if (lower === "indices") return "index";
  return lower;
}

export interface AssetClassStats {
  assetClass: string;
  tradeCount: number;
  totalPnL: number;
  averagePnL: number;
  winRate: number;
  averageR: number;
  profitFactor: number;
}

function safeNum(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

export function assetClassPerformance(trades: Trade[]): AssetClassStats[] {
  const c = closed(trades);
  const byClass = new Map<string, Trade[]>();
  for (const t of c) {
    const cls = normalizeClass(t.asset_class);
    if (!byClass.has(cls)) byClass.set(cls, []);
    byClass.get(cls)!.push(t);
  }
  const result: AssetClassStats[] = [];
  for (const [assetClass, list] of byClass) {
    const wins = list.filter((t) => t.result === "win").length;
    const totalPnL = list.reduce((a, t) => a + t.pnl, 0);
    const totalR = list.reduce((a, t) => a + t.r_multiple, 0);
    const grossProfit = list.filter((t) => t.pnl > 0).reduce((a, t) => a + t.pnl, 0);
    const grossLoss = Math.abs(list.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0));
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;
    result.push({
      assetClass,
      tradeCount: list.length,
      totalPnL,
      averagePnL: list.length > 0 ? totalPnL / list.length : 0,
      winRate: list.length > 0 ? (wins / list.length) * 100 : 0,
      averageR: list.length > 0 ? totalR / list.length : 0,
      profitFactor: profitFactor === Infinity ? 0 : safeNum(profitFactor),
    });
  }
  return result.sort((a, b) => b.totalPnL - a.totalPnL);
}
