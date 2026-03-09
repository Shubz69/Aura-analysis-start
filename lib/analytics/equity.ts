import type { Trade } from "@/types";
import { formatDate } from "@/lib/utils";

export interface EquityPoint {
  date: string;
  equity: number;
}

export function buildEquityCurve(trades: Trade[], startBalance: number): EquityPoint[] {
  const resolved = trades
    .filter((t) => t.result !== "open")
    .sort((a, b) => new Date(a.closed_at ?? a.created_at).getTime() - new Date(b.closed_at ?? b.created_at).getTime());
  if (resolved.length === 0) return [];
  const points: EquityPoint[] = [];
  let cum = startBalance;
  for (const t of resolved) {
    cum += t.pnl;
    points.push({
      date: formatDate(t.closed_at ?? t.created_at),
      equity: Math.round(cum * 100) / 100,
    });
  }
  return points;
}
