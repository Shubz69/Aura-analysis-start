/**
 * Trade grade and checklist calculations.
 * Grade mapping: 100 = A+, 80–99 = A, 60–79 = B, below 60 = C.
 * Numeric grade for averaging: A+ = 4, A = 3, B = 2, C = 1.
 */
import type { Trade } from "@/types";
import { getClosedTrades } from "@/lib/utils";

export function checklistPercent(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

export function percentToGrade(percent: number): string {
  if (percent >= 100) return "A+";
  if (percent >= 80) return "A";
  if (percent >= 60) return "B";
  return "C";
}

export function gradeToScore(grade: string | null): number {
  if (!grade) return 0;
  const g = grade.toUpperCase().replace(/\s/g, "");
  if (g === "A+") return 4;
  if (g === "A") return 3;
  if (g === "B") return 2;
  if (g === "C" || g === "D") return 1;
  return 0;
}

export function averageGradeScore(trades: Trade[]): number {
  const c = getClosedTrades(trades).filter((t) => t.trade_grade);
  if (c.length === 0) return 0;
  const sum = c.reduce((a, t) => a + gradeToScore(t.trade_grade), 0);
  return sum / c.length;
}

export interface GradeDistributionItem {
  grade: string;
  count: number;
  pnl: number;
  winRate: number;
}

const GRADE_ORDER = ["A+", "A", "B", "C"];

export function gradeDistribution(trades: Trade[]): GradeDistributionItem[] {
  const c = getClosedTrades(trades);
  const byGrade = new Map<string, Trade[]>();
  for (const t of c) {
    const g = t.trade_grade ?? "C";
    const key = g.toUpperCase().replace(/\s/g, "");
    const normalized = key === "A+" ? "A+" : key === "A" ? "A" : key === "B" ? "B" : "C";
    if (!byGrade.has(normalized)) byGrade.set(normalized, []);
    byGrade.get(normalized)!.push(t);
  }
  return GRADE_ORDER.map((grade) => {
    const list = byGrade.get(grade) ?? [];
    const wins = list.filter((t) => t.result === "win").length;
    return {
      grade,
      count: list.length,
      pnl: list.reduce((a, t) => a + t.pnl, 0),
      winRate: list.length > 0 ? (wins / list.length) * 100 : 0,
    };
  }).filter((r) => r.count > 0);
}

export function tradesByGrade(trades: Trade[]): Record<string, number> {
  const dist = gradeDistribution(trades);
  const out: Record<string, number> = {};
  dist.forEach((d) => (out[d.grade] = d.count));
  return out;
}

export function pnlByGrade(trades: Trade[]): Record<string, number> {
  const dist = gradeDistribution(trades);
  const out: Record<string, number> = {};
  dist.forEach((d) => (out[d.grade] = d.pnl));
  return out;
}

export function winRateByGrade(trades: Trade[]): Record<string, number> {
  const dist = gradeDistribution(trades);
  const out: Record<string, number> = {};
  dist.forEach((d) => (out[d.grade] = d.winRate));
  return out;
}
