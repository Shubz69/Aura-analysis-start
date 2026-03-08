/** Analytics barrel: explicit exports to avoid conflicting star exports. */

export {
  getResolvedTrades,
  pairPnL,
  sessionPnL,
  maxDrawdown,
  legacyConsistencyScore,
} from "./metrics";

export * from "./kpis";

export * from "./equity";
export {
  buildEquityCurveWithDrawdown,
  maxDrawdownAbsolute,
  maxDrawdownPercent,
  currentDrawdown,
  averageDrawdown,
} from "./drawdown";

export {
  currentWinStreak,
  currentLossStreak,
  longestWinStreak,
  longestLossStreak,
  streakSummary,
} from "./streaks";
export type { StreakSummary } from "./streaks";

export {
  pairPerformance,
  bestPair as bestPairFromPairs,
  worstPair as worstPairFromPairs,
  mostTradedPair,
} from "./pairPerformance";
export type { PairStats } from "./pairPerformance";

export * from "./sessionPerformance";
export * from "./assetClassPerformance";
export * from "./timeAnalytics";

export {
  checklistPercent,
  percentToGrade,
  gradeToScore,
  averageGradeScore,
  gradeDistribution,
  tradesByGrade,
  pnlByGrade,
  winRateByGrade,
} from "./grades";

export { consistencyScore, consistencyScoreBreakdown } from "./consistency";
export * from "./leaderboard";
export * from "./chartDatasets";
