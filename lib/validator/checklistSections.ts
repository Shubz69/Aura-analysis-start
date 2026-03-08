/**
 * Trade Validator – 8 checklist sections with reference images and point values.
 * Images live in /assets/trading-checklist/
 */

export interface ChecklistItem {
  id: string;
  label: string;
  points: number;
}

export interface ChecklistSectionConfig {
  id: string;
  title: string;
  imagePath: string;
  maxPoints: number;
  items: ChecklistItem[];
}

/** Sub-pattern for Section 6 (Pattern Setup). */
export interface PatternSubSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface PatternSectionConfig {
  id: string;
  title: string;
  imagePath: string;
  maxPoints: number;
  subPatterns: PatternSubSection[];
}

export type SectionConfig = ChecklistSectionConfig | PatternSectionConfig;

export function isPatternSection(s: SectionConfig): s is PatternSectionConfig {
  return "subPatterns" in s && Array.isArray((s as PatternSectionConfig).subPatterns);
}

const BASE_IMAGE = "/assets/trading-checklist";

export const CHECKLIST_SECTIONS: SectionConfig[] = [
  {
    id: "htf-bias",
    title: "Higher Timeframe Bias",
    imagePath: `${BASE_IMAGE}/trend-structure.png`,
    maxPoints: 25,
    items: [
      { id: "htf-1", label: "Weekly trend identified", points: 7 },
      { id: "htf-2", label: "Daily trend aligned", points: 6 },
      { id: "htf-3", label: "Higher highs / higher lows visible", points: 6 },
      { id: "htf-4", label: "Price aligned with HTF EMA", points: 6 },
    ],
  },
  {
    id: "liquidity",
    title: "Liquidity Sweep",
    imagePath: `${BASE_IMAGE}/liquidity-sweep.png`,
    maxPoints: 20,
    items: [
      { id: "liq-1", label: "Equal highs or equal lows present", points: 5 },
      { id: "liq-2", label: "Liquidity sweep occurs", points: 5 },
      { id: "liq-3", label: "Strong rejection after sweep", points: 5 },
      { id: "liq-4", label: "Entry positioned after sweep", points: 5 },
    ],
  },
  {
    id: "supply-demand",
    title: "Supply / Demand Zone",
    imagePath: `${BASE_IMAGE}/supply-demand.png`,
    maxPoints: 15,
    items: [
      { id: "sd-1", label: "Strong impulsive move from zone", points: 4 },
      { id: "sd-2", label: "Zone not mitigated", points: 4 },
      { id: "sd-3", label: "Price returns to zone", points: 4 },
      { id: "sd-4", label: "Reaction inside zone", points: 3 },
    ],
  },
  {
    id: "bos",
    title: "Break of Structure",
    imagePath: `${BASE_IMAGE}/break-of-structure.png`,
    maxPoints: 15,
    items: [
      { id: "bos-1", label: "Previous swing high/low broken", points: 5 },
      { id: "bos-2", label: "Momentum candle break", points: 5 },
      { id: "bos-3", label: "Close beyond structure", points: 5 },
    ],
  },
  {
    id: "break-retest",
    title: "Break and Retest",
    imagePath: `${BASE_IMAGE}/break-retest.png`,
    maxPoints: 10,
    items: [
      { id: "br-1", label: "Price returns to broken structure", points: 4 },
      { id: "br-2", label: "Level flips support/resistance", points: 3 },
      { id: "br-3", label: "Entry after rejection candle", points: 3 },
    ],
  },
  {
    id: "pattern",
    title: "Pattern Setup",
    imagePath: `${BASE_IMAGE}/falling-wedge.png`,
    maxPoints: 10,
    subPatterns: [
      {
        id: "pattern-elliott",
        title: "Elliott Wave",
        items: [
          { id: "pe-1", label: "Clear wave structure visible", points: 2 },
          { id: "pe-2", label: "Correct wave count", points: 2 },
        ],
      },
      {
        id: "pattern-rising",
        title: "Rising Wedge",
        items: [
          { id: "pr-1", label: "Converging trendlines", points: 1.5 },
          { id: "pr-2", label: "Break of wedge confirmed", points: 1.5 },
        ],
      },
      {
        id: "pattern-falling",
        title: "Falling Wedge",
        items: [
          { id: "pf-1", label: "Converging trendlines", points: 1.5 },
          { id: "pf-2", label: "Break of wedge confirmed", points: 1.5 },
        ],
      },
    ],
  },
  {
    id: "entry",
    title: "Entry Confirmation",
    imagePath: `${BASE_IMAGE}/entry-confirmation.png`,
    maxPoints: 3,
    items: [
      { id: "ent-1", label: "Engulfing candle", points: 1 },
      { id: "ent-2", label: "Pin bar rejection", points: 1 },
      { id: "ent-3", label: "Momentum candle", points: 1 },
    ],
  },
  {
    id: "risk",
    title: "Risk Management",
    imagePath: `${BASE_IMAGE}/risk.png`,
    maxPoints: 2,
    items: [
      { id: "risk-1", label: "Minimum Risk Reward 1:3", points: 1 },
      { id: "risk-2", label: "Stop loss below structure", points: 0.5 },
      { id: "risk-3", label: "Trade aligns with HTF bias", points: 0.5 },
    ],
  },
];

/** All item ids with their point values (for score calculation). Total points = 100. */
export function getPointsByItemId(): Map<string, number> {
  const map = new Map<string, number>();
  for (const section of CHECKLIST_SECTIONS) {
    if (isPatternSection(section)) {
      for (const sub of section.subPatterns) {
        for (const item of sub.items) {
          map.set(item.id, item.points);
        }
      }
    } else {
      for (const item of section.items) {
        map.set(item.id, item.points);
      }
    }
  }
  return map;
}

export const TOTAL_POINTS = 100;

/** All items in a section (flat for pattern section with subPatterns). */
export function getSectionItems(
  section: ChecklistSectionConfig | PatternSectionConfig
): ChecklistItem[] {
  if (isPatternSection(section)) {
    return section.subPatterns.flatMap((p) => p.items);
  }
  return section.items;
}

/** Section score 0–100 from checked set. */
export function getSectionScore(
  section: ChecklistSectionConfig | PatternSectionConfig,
  checked: Set<string>
): number {
  const items = getSectionItems(section);
  const maxPoints = section.maxPoints;
  if (maxPoints <= 0) return 0;
  const earned = items.reduce(
    (sum, item) => sum + (checked.has(item.id) ? item.points : 0),
    0
  );
  return Math.round((earned / maxPoints) * 100);
}
