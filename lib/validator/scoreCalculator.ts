/**
 * Trade Validator – global scoring engine.
 * Total score = sum of points for checked items (max 100).
 */

export const SCORE_LABELS = {
  noTrade: "No Trade",
  risky: "Risky",
  moderate: "Moderate",
  goodSetup: "Good Setup",
  highProbability: "High Probability",
  aPlus: "A+ Setup",
} as const;

export type ScoreLabelKey = keyof typeof SCORE_LABELS;

/** 0–40 No Trade, 40–60 Risky, 60–70 Moderate, 70–80 Good Setup, 80–90 High Probability, 90–100 A+ */
export function getScoreLabel(percent: number): string {
  if (percent >= 90) return SCORE_LABELS.aPlus;
  if (percent >= 80) return SCORE_LABELS.highProbability;
  if (percent >= 70) return SCORE_LABELS.goodSetup;
  if (percent >= 60) return SCORE_LABELS.moderate;
  if (percent >= 40) return SCORE_LABELS.risky;
  return SCORE_LABELS.noTrade;
}

/** Returns 0–100. totalPossible must be the sum of all item points (100). */
export function calculateTotalScore(
  checkedIds: Set<string>,
  pointsByItemId: Map<string, number>,
  totalPossible: number
): number {
  if (totalPossible <= 0) return 0;
  let sum = 0;
  checkedIds.forEach((id) => {
    sum += pointsByItemId.get(id) ?? 0;
  });
  return Math.min(100, Math.round((sum / totalPossible) * 100));
}

/** Clamp value for progress bar. */
export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}
