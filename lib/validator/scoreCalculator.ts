/**
 * Trade Validator – global scoring engine.
 * Total score = sum of points for checked items (max 200).
 */

import { CHECKLIST_SECTIONS, getSectionScore } from "./checklistSections";

export const SCORE_LABELS = {
  noTrade: "No Trade",
  weakSetup: "Weak Setup",
  risky: "Risky / Not Ready",
  validTrade: "Valid Trade",
  strongTrade: "Strong Trade",
  highProbability: "High Probability",
  aPlus: "A+ Institutional Setup",
} as const;

export type ScoreLabelKey = keyof typeof SCORE_LABELS;

/** 
 * 0–39 No Trade
 * 40–59 Weak Setup
 * 60–69 Risky / Not Ready
 * 70–99 Valid Trade
 * 100–139 Strong Trade
 * 140–169 High Probability
 * 170–200 A+ Institutional Setup
 */
export function getScoreLabel(percent: number): string {
  if (percent >= 170) return SCORE_LABELS.aPlus;
  if (percent >= 140) return SCORE_LABELS.highProbability;
  if (percent >= 100) return SCORE_LABELS.strongTrade;
  if (percent >= 70) return SCORE_LABELS.validTrade;
  if (percent >= 60) return SCORE_LABELS.risky;
  if (percent >= 40) return SCORE_LABELS.weakSetup;
  return SCORE_LABELS.noTrade;
}

/** Returns 0–200. totalPossible should be 200. */
export function calculateTotalScore(
  checkedIds: Set<string>,
  pointsByItemId: Record<string, number>,
  totalPossible: number
): number {
  if (totalPossible <= 0) return 0;
  let sum = 0;
  checkedIds.forEach((id) => {
    sum += pointsByItemId[id] ?? 0;
  });
  return Math.min(200, Math.round(sum));
}

/** Clamp value for progress bar. Max is now 200 */
export function clampPercent(value: number): number {
  return Math.max(0, Math.min(200, value));
}

export function buildValidatorData(
  checked: Set<string>,
  pointsByItemId: Record<string, number>,
  totalPoints: number
) {
  const totalScore = calculateTotalScore(checked, pointsByItemId, totalPoints);
  const clampedScore = clampPercent(totalScore);
  const label = getScoreLabel(totalScore);

  const checklistState: Record<string, boolean> = {};
  checked.forEach(id => {
    checklistState[id] = true;
  });
  
  const sectionScores: Record<string, number> = {};
  CHECKLIST_SECTIONS.forEach(section => {
    sectionScores[section.id] = getSectionScore(section, checked);
  });

  return {
    score: clampedScore,
    status: label,
    checklistState,
    sectionScores,
    completedAt: new Date().toISOString(),
  };
}

export function parseValidatorData(data: unknown): ReturnType<typeof buildValidatorData> | null {
  if (!data) return null;
  try {
    const vd = typeof data === "string" ? JSON.parse(data) : data;
    if (vd && typeof vd === "object") {
      return vd as ReturnType<typeof buildValidatorData>;
    }
  } catch {
    // ignore
  }
  return null;
}
