/**
 * Prints cleanup summary after refactor (legacy removal, single source of truth).
 * Run: npx tsx scripts/cleanup-summary.ts
 */

console.log("\n========== CODE CLEANUP SUMMARY ==========\n");

const summary = {
  filesRemoved: [
    "lib/trade-calculations.ts (legacy risk engine – replaced by lib/calculators/)",
    "lib/trade-calculations.test.ts (legacy tests – covered by lib/calculators/calculateRisk.test.ts)",
  ],
  duplicateFunctionsRemoved: [
    "calcPositionSize (trade-calculations) – use calculateRisk() from lib/calculators",
    "calcRiskAmount, calcStopLossDistance, calcTakeProfitDistance (trade-calculations) – inside calculateRisk()",
    "calcPotentialProfit, calcPotentialLoss, calcTradePnL (trade-calculations) – in calculator results and closedTradePnL.ts",
    "getPipValueForPnL, getAssetMeta, getPipMultiplier (trade-calculations) – instrument-based in lib/calculators",
    "calcChecklistPercent, calcTradeGrade (trade-calculations) – use lib/config/checklistDefault.ts and lib/analytics/grades.ts",
    "formatMoney, formatDistance, safeNum (lib/calculators/utils.ts) – unused; display uses lib/utils",
  ],
  unusedImportsRemoved: [
    "lib/analytics/metrics.ts: removed import from @/lib/trade-calculations (legacy consistency inlined)",
  ],
  legacyCalculatorModulesDeleted: [
    "lib/trade-calculations.ts – all risk/position/pip logic removed; closed-trade PnL moved to lib/calculators/closedTradePnL.ts",
    "Legacy consistency score logic inlined into lib/analytics/metrics.ts (legacyConsistencyScore)",
  ],
  singleSourceOfTruth: [
    "Risk calculations: lib/calculators/ (calculateRisk.ts, forexCalculator, commodityCalculator, indexCalculator, stockCalculator, futuresCalculator, cryptoCalculator, closedTradePnL.ts)",
    "Instrument metadata: lib/instruments.ts",
    "Display/asset list: lib/config/auraAnalysisAssets.ts",
    "Checklist percent/grade: lib/config/checklistDefault.ts (calculator UI), lib/analytics/grades.ts (analytics)",
  ],
};

console.log("FILES REMOVED");
console.log("--------------");
summary.filesRemoved.forEach((f) => console.log("  •", f));

console.log("\nDUPLICATE FUNCTIONS REMOVED");
console.log("---------------------------");
summary.duplicateFunctionsRemoved.forEach((f) => console.log("  •", f));

console.log("\nUNUSED IMPORTS / DEAD CODE REMOVED");
console.log("-----------------------------------");
summary.unusedImportsRemoved.forEach((f) => console.log("  •", f));

console.log("\nLEGACY CALCULATOR MODULES DELETED");
console.log("----------------------------------");
summary.legacyCalculatorModulesDeleted.forEach((f) => console.log("  •", f));

console.log("\nSINGLE SOURCE OF TRUTH");
console.log("----------------------");
summary.singleSourceOfTruth.forEach((f) => console.log("  •", f));

console.log("\n==========================================\n");
