/**
 * Consistency score: weighted 0–100 from five components.
 *
 * Formula (documented, easy to tune):
 *   consistencyScore =
 *     riskDisciplineScore   * 0.25 +
 *     checklistQualityScore * 0.25 +
 *     journalRegularityScore * 0.20 +
 *     streakStabilityScore  * 0.15 +
 *     executionQualityScore * 0.15
 */
import type { Trade } from "@/types";

const RESOLVED = ["win", "loss", "breakeven"];

function closed(trades: Trade[]): Trade[] {
  return trades.filter((t) => RESOLVED.includes(t.result));
}

/** 0–100: how often risk_percent is within 0.5–2% and consistent. */
function riskDisciplineScore(trades: Trade[]): number {
  const c = closed(trades).filter((t) => t.risk_percent != null && t.risk_percent > 0);
  if (c.length === 0) return 50;
  const inRange = c.filter((t) => t.risk_percent >= 0.5 && t.risk_percent <= 2).length;
  const ratio = inRange / c.length;
  const std = (() => {
    const mean = c.reduce((a, t) => a + t.risk_percent, 0) / c.length;
    const variance = c.reduce((a, t) => a + (t.risk_percent - mean) ** 2, 0) / c.length;
    return Math.sqrt(variance);
  })();
  const consistency = std <= 0.5 ? 100 : std <= 1 ? 80 : std <= 2 ? 60 : 40;
  return Math.round(ratio * 60 + (consistency / 100) * 40);
}

/** 0–100: average checklist_percent. */
function checklistQualityScore(trades: Trade[]): number {
  const c = closed(trades).filter((t) => t.checklist_total > 0);
  if (c.length === 0) return 50;
  const avg = c.reduce((a, t) => a + t.checklist_percent, 0) / c.length;
  return Math.min(100, Math.round(avg));
}

/** 0–100: trade frequency regularity (trades per week variance). */
function journalRegularityScore(trades: Trade[]): number {
  const c = closed(trades).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  if (c.length < 2) return 50;
  const first = new Date(c[0].created_at).getTime();
  const last = new Date(c[c.length - 1].created_at).getTime();
  const weeks = (last - first) / (7 * 24 * 60 * 60 * 1000) || 1;
  const tradesPerWeek = c.length / weeks;
  if (tradesPerWeek < 0.5) return 30;
  if (tradesPerWeek >= 1 && tradesPerWeek <= 10) return 80;
  return 60;
}

/** 0–100: inverse of streak volatility (longest win + longest loss). */
function streakStabilityScore(trades: Trade[]): number {
  let maxWin = 0;
  let maxLoss = 0;
  let curWin = 0;
  let curLoss = 0;
  const list = closed(trades).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  for (const t of list) {
    if (t.result === "win") {
      curWin++;
      curLoss = 0;
      if (curWin > maxWin) maxWin = curWin;
    } else if (t.result === "loss") {
      curLoss++;
      curWin = 0;
      if (curLoss > maxLoss) maxLoss = curLoss;
    } else {
      curWin = 0;
      curLoss = 0;
    }
  }
  const total = maxWin + maxLoss;
  if (total <= 2) return 100;
  if (total <= 5) return 80;
  if (total <= 10) return 60;
  return Math.max(20, 60 - total);
}

/** 0–100: execution quality (avg R for winners, limited damage on losers). */
function executionQualityScore(trades: Trade[]): number {
  const c = closed(trades);
  if (c.length === 0) return 50;
  const winners = c.filter((t) => t.result === "win");
  const losers = c.filter((t) => t.result === "loss");
  const avgWinR = winners.length ? winners.reduce((a, t) => a + t.r_multiple, 0) / winners.length : 0;
  const avgLossR = losers.length ? Math.abs(losers.reduce((a, t) => a + t.r_multiple, 0) / losers.length) : 0;
  let score = 50;
  if (avgWinR >= 1.5) score += 25;
  else if (avgWinR >= 1) score += 15;
  if (avgLossR <= 1.2) score += 25;
  else if (avgLossR <= 1.5) score += 10;
  return Math.min(100, score);
}

const WEIGHTS = {
  riskDiscipline: 0.25,
  checklistQuality: 0.25,
  journalRegularity: 0.2,
  streakStability: 0.15,
  executionQuality: 0.15,
} as const;

export function consistencyScore(trades: Trade[]): number {
  const c = closed(trades);
  if (c.length < 2) return 0;
  const risk = riskDisciplineScore(trades);
  const checklist = checklistQualityScore(trades);
  const journal = journalRegularityScore(trades);
  const streak = streakStabilityScore(trades);
  const execution = executionQualityScore(trades);
  const score =
    risk * WEIGHTS.riskDiscipline +
    checklist * WEIGHTS.checklistQuality +
    journal * WEIGHTS.journalRegularity +
    streak * WEIGHTS.streakStability +
    execution * WEIGHTS.executionQuality;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function consistencyScoreBreakdown(trades: Trade[]) {
  const c = closed(trades);
  if (c.length < 2) {
    return {
      consistencyScore: 0,
      riskDisciplineScore: 0,
      checklistQualityScore: 0,
      journalRegularityScore: 0,
      streakStabilityScore: 0,
      executionQualityScore: 0,
      weights: WEIGHTS,
    };
  }
  return {
    consistencyScore: consistencyScore(trades),
    riskDisciplineScore: riskDisciplineScore(trades),
    checklistQualityScore: checklistQualityScore(trades),
    journalRegularityScore: journalRegularityScore(trades),
    streakStabilityScore: streakStabilityScore(trades),
    executionQualityScore: executionQualityScore(trades),
    weights: WEIGHTS,
  };
}
