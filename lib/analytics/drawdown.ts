/**
 * Drawdown calculations from equity curve.
 */
import type { Trade } from "@/types";

export interface EquityPoint {
  date: string;
  equity: number;
  cumulativePnL: number;
  peakEquity: number;
  drawdown: number;
  drawdownPercent: number;
}

export function buildEquityCurveWithDrawdown(
  trades: Trade[],
  startBalance: number
): EquityPoint[] {
  const resolved = trades
    .filter((t) => t.result !== "open")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  if (resolved.length === 0) return [];
  const points: EquityPoint[] = [];
  let cumPnL = 0;
  let peak = startBalance;
  for (const t of resolved) {
    cumPnL += t.pnl;
    const equity = startBalance + cumPnL;
    if (equity > peak) peak = equity;
    const drawdown = peak - equity;
    const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
    points.push({
      date: new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
      equity: Math.round(equity * 100) / 100,
      cumulativePnL: Math.round(cumPnL * 100) / 100,
      peakEquity: peak,
      drawdown: Math.round(drawdown * 100) / 100,
      drawdownPercent: Math.round(drawdownPercent * 100) / 100,
    });
  }
  return points;
}

export function maxDrawdownAbsolute(trades: Trade[], startBalance: number): number {
  const curve = buildEquityCurveWithDrawdown(trades, startBalance);
  if (curve.length === 0) return 0;
  return Math.max(...curve.map((p) => p.drawdown));
}

export function maxDrawdownPercent(trades: Trade[], startBalance: number): number {
  const curve = buildEquityCurveWithDrawdown(trades, startBalance);
  if (curve.length === 0) return 0;
  return Math.max(...curve.map((p) => p.drawdownPercent));
}

export function currentDrawdown(trades: Trade[], startBalance: number): number {
  const curve = buildEquityCurveWithDrawdown(trades, startBalance);
  if (curve.length === 0) return 0;
  return curve[curve.length - 1].drawdown;
}

export function averageDrawdown(trades: Trade[], startBalance: number): number {
  const curve = buildEquityCurveWithDrawdown(trades, startBalance);
  if (curve.length === 0) return 0;
  const sum = curve.reduce((a, p) => a + p.drawdown, 0);
  return sum / curve.length;
}
