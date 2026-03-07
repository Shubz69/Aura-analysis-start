# Aura Analysis — Full Calculation & Analytics Engine

This document lists all calculation files, analytics functions, chart datasets, formulas, the 5 validation scenario results, assumptions, and remaining weak spots.

---

## 1. Calculation & config files

| File | Purpose |
|------|--------|
| **lib/trade-calculations.ts** | Core trade math: risk amount, SL/TP distance, RR, position size, potential P/L, trade PnL (direction-aware), R-multiple, checklist %, grade, consistency; `getClosedTradeResult`, `calcClosedTradePnLAndR`. |
| **lib/config/auraAnalysisAssets.ts** | Asset metadata: symbol, displayName, assetClass, distanceType (pip/point/price), pipMultiplier, pricePrecision, quantityPrecision, contractSizeHint, pipValueHint; `getAssetMetadata(symbol)`, `getAllAssetMetadata()`. |
| **lib/utils.ts** | Formatters: formatCurrency, formatPercent, formatNumber, formatDistance, formatRR, formatPositionSize, formatCurrencySafe, formatPercentSafe, safeNum. |
| **lib/validations/trade.ts** | Validation: pair required, accountBalance > 0, riskPercent > 0, entry/stopLoss/takeProfit > 0, stopLoss ≠ entry, takeProfit ≠ entry. |

---

## 2. Analytics modules (lib/analytics/)

| Module | Exports |
|--------|--------|
| **metrics.ts** | getResolvedTrades, totalTrades (resolved), winRate, breakevenRate, averageR, averageRR, totalPnL, profitFactor, expectancy, bestPair, worstPair, pairPnL, sessionPnL, maxDrawdown, longestWinStreak, longestLossStreak, averageChecklistPercent, consistencyScore (legacy). |
| **kpis.ts** | totalTrades, openTrades, closedTrades, wins, losses, breakevens, winRate, lossRate, breakevenRate, totalPnL, averagePnL, totalR, averageR, averageRR, totalRiskAmount, averageRiskPercent, profitFactor, expectancy, bestTradePnL, worstTradePnL, bestPair, worstPair, bestSession, worstSession, averageChecklistPercent, averageChecklistScore, gradeToScore, averageTradeGradeScore, buildKpiSummary. |
| **equity.ts** | buildEquityCurve(trades, startBalance) → { date, equity }. |
| **drawdown.ts** | buildEquityCurveWithDrawdown, maxDrawdownAbsolute, maxDrawdownPercent, currentDrawdown, averageDrawdown. |
| **streaks.ts** | currentWinStreak, currentLossStreak, longestWinStreak, longestLossStreak, streakSummary. |
| **pairPerformance.ts** | pairPerformance, bestPair, worstPair, mostTradedPair, PairStats. |
| **sessionPerformance.ts** | sessionPerformance, SessionStats. |
| **assetClassPerformance.ts** | assetClassPerformance, AssetClassStats. |
| **timeAnalytics.ts** | tradesByDay, tradesByWeek, tradesByMonth, tradesByWeekday. |
| **grades.ts** | checklistPercent, percentToGrade, gradeToScore, averageGradeScore, gradeDistribution, tradesByGrade, pnlByGrade, winRateByGrade. |
| **consistency.ts** | consistencyScore (weighted 0–100), consistencyScoreBreakdown. |
| **leaderboard.ts** | leaderboardFromTradesByUser(tradesByUser, sortBy), LeaderboardUser, LeaderboardSortKey. |
| **chartDatasets.ts** | buildOverviewDatasets, buildAnalyticsDatasets, buildLeaderboardDatasets. |

---

## 3. Chart datasets supported

- **Overview:** kpiSummary, equityCurveData, recentTrades, pairPerformanceTop5, sessionPerformanceData, gradeDistributionData.
- **Analytics:** equityCurveData (with drawdown), drawdownCurveData, pnlOverTimeData, monthlyPnlData, weekdayPnlData, pairPerformanceData, sessionPerformanceData, assetClassPerformanceData, gradeDistributionData, winLossDistributionData, streakSummaryData.
- **Leaderboard:** rankedUsers, leaderboardChartData (top 10).

All datasets use safeNum; no NaN/Infinity in output.

---

## 4. Formulas (KPIs)

| KPI | Formula |
|-----|--------|
| riskAmount | accountBalance × (riskPercent / 100) |
| stopLossDistance | \|entry − stop\| × pipMultiplier (asset-aware) |
| takeProfitDistance | \|tp − entry\| × pipMultiplier |
| riskRewardRatio | takeProfitDistance / stopLossDistance (price-based: \|tp−entry\| / \|entry−stop\|) |
| positionSize | riskAmount / (stopLossPips × pipValue) |
| potentialProfit | takeProfitPips × pipValue × positionSize |
| potentialLoss | stopLossPips × pipValue × positionSize |
| tradePnL (BUY) | (exit − entry) × mult × pipValue × positionSize |
| tradePnL (SELL) | (entry − exit) × mult × pipValue × positionSize |
| rMultiple | pnl / riskAmount |
| winRate | wins / closedTrades × 100 |
| lossRate | losses / closedTrades × 100 |
| breakevenRate | breakevens / closedTrades × 100 |
| averageR | sum(rMultiple) / closedTrades (excluding BE for avg R is optional; here all closed) |
| averageRR | sum(plannedRR) / totalTrades |
| profitFactor | grossProfit / \|grossLoss\| |
| expectancy | (winRate × avgWinR) − (lossRate × avgLossR) |
| consistencyScore | 0.25×riskDiscipline + 0.25×checklistQuality + 0.20×journalRegularity + 0.15×streakStability + 0.15×executionQuality |

---

## 5. Consistency score (documented)

- **riskDisciplineScore:** 0–100 from risk % in range 0.5–2% and low variance.
- **checklistQualityScore:** average checklist_percent.
- **journalRegularityScore:** trade frequency regularity (trades per week).
- **streakStabilityScore:** inverse of longest win + longest loss streaks.
- **executionQualityScore:** avg winner R and avg loser R (limited damage).

`consistencyScore = riskDiscipline×0.25 + checklistQuality×0.25 + journalRegularity×0.20 + streakStability×0.15 + executionQuality×0.15` (capped 0–100).

---

## 6. Grade mapping

- 100 → A+
- 80–99 → A
- 60–79 → B
- &lt;60 → C  

Numeric for averaging: A+ = 4, A = 3, B = 2, C = 1.

---

## 7. Five validation scenarios (expected ballpark)

| Scenario | riskAmount | stopDistance | tpDistance | RR | positionSize | potentialProfit | potentialLoss |
|----------|------------|--------------|------------|-----|--------------|-----------------|---------------|
| **1) EURUSD** 10k, 1%, entry 1.0850, stop 1.0830, tp 1.0900 | 100 | 200 pips | 500 pips | 2.5 | 0.05 lots | 250 | 100 |
| **2) GBPJPY** 25k, 0.5%, 191.2, 190.8, 192.3 | 125 | 40 pips | 110 pips | 2.75 | 0.3125 lots | 343.75 | 125 |
| **3) XAUUSD** 15k, 1%, 2900, 2888, 2928 | 150 | 120 pts | 280 pts | 2.33 | 1.25 | 350 | 150 |
| **4) US30** 20k, 1%, 42000, 41850, 42350 | 200 | 150 pts | 350 pts | 2.33 | 1.33 | 466.67 | 200 |
| **5) BTCUSD** 12k, 1%, 92000, 90500, 95000 | 120 | 1500 (price) | 3000 (price) | 2 | 0.08 | 240 | 120 |

*Exact values depend on pipValueHint/contractSize used in `lib/trade-calculations` and `lib/config/auraAnalysisAssets`. Run the app calculator or a small test to confirm.*

---

## 8. Assumptions

- **Distance:** Forex non-JPY: pips (mult 10000); JPY pairs: pips (100); metals: points (10 for XAU, 100 for XAG); indices: points (1); crypto/oil: price or points per asset config.
- **PnL:** Standard lot pip value 10 for forex; JPY pip value 10; metals/indices use pipValueHint from asset metadata.
- **Sessions:** Asian, London, New York, London/NY Overlap (and Unknown).
- **Asset classes:** forex, metal/metals, commodity, energy, index/indices, crypto (normalized in assetClassPerformance).
- **Equity curve:** Ordered by trade `created_at`; start balance + cumulative PnL; drawdown from running peak.

---

## 9. Empty / fallback / error handling

- Division by zero: return 0 or safe denominator.
- Missing pair metadata: `getAssetMetadata` returns inferred defaults (JPY, XAU, indices, crypto, default forex).
- No trades: KPIs 0, empty arrays for charts; “No data yet” should be handled in UI.
- NaN/Infinity: `safeNum()` in formatters and chart datasets; profitFactor Infinity → 0 in display.

---

## 10. Remaining weak spots to improve

- **Drawdown duration:** Not yet computed (time in drawdown); can be added from equity curve.
- **Leaderboard:** Currently assumes trades grouped by user in a Map; integrate with real API (e.g. by user_id).
- **Calculator:** Ensure all calculator dropdown assets use metadata from `getAssetMetadata` or DB assets with pip_multiplier/pip_value_hint so all 5 scenarios match across UI and API.
- **Tests:** Add unit tests for trade-calculations (all 5 scenarios) and for analytics (KPI formulas, equity, drawdown, streaks, consistency).
- **Crypto position size:** Convention (per unit vs per contract) may need broker-specific pipValueHint; document for users.

---

## 11. Wiring the dashboard

- **Overview:** Use `buildKpiSummary(trades)` and `buildOverviewDatasets(trades, startBalance)` from `@/lib/analytics`.
- **Analytics:** Use `buildAnalyticsDatasets(trades, startBalance)`.
- **Leaderboard:** Group trades by `user_id`, then `leaderboardFromTradesByUser(map, sortBy)` and `buildLeaderboardDatasets(map, sortBy)`.
- **Calculator:** Keep using `lib/trade-calculations` with asset metadata from DB or `getAssetMetadata`; validate with `tradeCalculatorSchema` before submit.

This completes the full calculation and analytics engine for the Aura Analysis dashboard.
