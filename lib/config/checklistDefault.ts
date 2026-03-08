/**
 * Default pre-trade checklist for Aura Analysis.
 * Used when no checklist template is loaded from DB.
 */

export interface ChecklistItemConfig {
  id: string;
  label: string;
  sortOrder: number;
}

export const DEFAULT_CHECKLIST_ITEMS: ChecklistItemConfig[] = [
  { id: "trend", label: "Trend aligned with higher timeframe bias", sortOrder: 1 },
  { id: "liquidity", label: "Liquidity sweep confirmed", sortOrder: 2 },
  { id: "structure", label: "Market structure confirmed", sortOrder: 3 },
  { id: "session", label: "Session is valid for this setup", sortOrder: 4 },
  { id: "risk", label: "Risk is within allowed limit", sortOrder: 5 },
  { id: "poi", label: "Entry is at a key level / POI", sortOrder: 6 },
  { id: "confluence", label: "Confluence is present", sortOrder: 7 },
  { id: "rr", label: "RR is acceptable for the setup", sortOrder: 8 },
  { id: "plan", label: "Trade follows my trading plan", sortOrder: 9 },
  { id: "forcing", label: "I am not forcing this trade", sortOrder: 10 },
];

export const CHECKLIST_TOTAL = DEFAULT_CHECKLIST_ITEMS.length;

/** checklistPercent = (score / total) * 100 */
export function calcChecklistPercent(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

/** 100 = A+, 80–99 = A, 60–79 = B, below 60 = C */
export function checklistPercentToGrade(percent: number): string {
  if (percent >= 100) return "A+";
  if (percent >= 80) return "A";
  if (percent >= 60) return "B";
  return "C";
}
