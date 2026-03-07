# Aura Analysis Dashboard — Test Guide

Use this order to verify the full calculation and analytics system. With **BYPASS_AUTH** (test mode), the app uses demo trades; you can also add real trades via the calculator and confirm numbers end-to-end.

---

## 1. Test order (pages)

Test in this order so each step feeds the next:

| Order | Page | Why first |
|-------|------|-----------|
| **1** | **Calculator** | Validates core math (risk, distance, RR, position size, P/L). All other pages depend on trade data computed or saved from here. |
| **2** | **Overview** | KPIs and charts (equity, pair, session) come from the same trades. Confirms totals, win rate, profit factor, best/worst pair. |
| **3** | **Journal** | Lists the same trades; filters and detail sheet use the same formatting and data. |
| **4** | **Analytics** | Deeper metrics (expectancy, drawdown, streaks, consistency). Confirms analytics engine output. |
| **5** | **Leaderboard** | Uses same KPI/consistency logic; in test mode shows one row from demo trades. |

---

## 2. Calculator — sample trades to input

Enter these **one at a time** in the Calculator, then compare the “Calculated” panel to the expected values. Use **Save trade** if your app persists trades (or note values for manual check).

### Scenario 1 — EURUSD (forex, pips)

| Field | Value |
|-------|--------|
| Pair | **EURUSD** |
| Direction | Buy |
| Account balance | **10000** |
| Risk % | **1** |
| Entry | **1.0850** |
| Stop loss | **1.0830** |
| Take profit | **1.0900** |
| Session | (any, e.g. London) |

**Expected (ballpark):**

- Risk amount: **$100.00**
- Stop loss: **20 pips** (0.0020 × 10000)
- Take profit: **50 pips**
- Risk:reward: **2.50**
- Position size: **0.05 lots**
- Potential profit: **~$250**
- Potential loss: **~$100**

---

### Scenario 2 — GBPJPY (forex JPY, pips)

| Field | Value |
|-------|--------|
| Pair | **GBPJPY** |
| Direction | Buy |
| Account balance | **25000** |
| Risk % | **0.5** |
| Entry | **191.200** |
| Stop loss | **190.800** |
| Take profit | **192.300** |
| Session | (any) |

**Expected (ballpark):**

- Risk amount: **$125.00**
- Stop loss: **40 pips**
- Take profit: **110 pips**
- Risk:reward: **2.75**
- Position size: **~0.31 lots**
- Potential profit: **~$344**
- Potential loss: **~$125**

---

### Scenario 3 — XAUUSD (gold, points)

| Field | Value |
|-------|--------|
| Pair | **XAUUSD** |
| Direction | Buy |
| Account balance | **15000** |
| Risk % | **1** |
| Entry | **2900** |
| Stop loss | **2888** |
| Take profit | **2928** |
| Session | (any) |

**Expected (ballpark):**

- Risk amount: **$150.00**
- Stop loss: **120 pts** (12 × 10)
- Take profit: **280 pts**
- Risk:reward: **~2.33**
- Position size: **~1.25** (lots/units)
- Potential profit: **~$350**
- Potential loss: **~$150**

---

### Scenario 4 — US30 (index, points)

| Field | Value |
|-------|--------|
| Pair | **US30** |
| Direction | Buy |
| Account balance | **20000** |
| Risk % | **1** |
| Entry | **42000** |
| Stop loss | **41850** |
| Take profit | **42350** |
| Session | (any) |

**Expected (ballpark):**

- Risk amount: **$200.00**
- Stop loss: **150 pts**
- Take profit: **350 pts**
- Risk:reward: **~2.33**
- Position size: **~1.33 contracts**
- Potential profit: **~$467**
- Potential loss: **~$200**

---

### Scenario 5 — BTCUSD (crypto, price units)

| Field | Value |
|-------|--------|
| Pair | **BTCUSD** |
| Direction | Buy |
| Account balance | **12000** |
| Risk % | **1** |
| Entry | **92000** |
| Stop loss | **90500** |
| Take profit | **95000** |
| Session | (any) |

**Expected (ballpark):**

- Risk amount: **$120.00**
- Stop loss: **1500** (price units)
- Take profit: **3000**
- Risk:reward: **2.00**
- Position size: **~0.08**
- Potential profit: **~$240**
- Potential loss: **~$120**

---

## 3. What to check on each page

### Calculator
- [ ] Risk amount = balance × (risk% / 100).
- [ ] Distance labels match asset: “pips” (EURUSD, GBPJPY), “pts” (XAUUSD, US30), “units” (BTCUSD).
- [ ] Position size unit: “lots” for forex/metals, “contracts” for US30.
- [ ] Potential loss ≈ risk amount (within rounding).
- [ ] No NaN, Infinity, or blank values when inputs are valid.

### Overview
- [ ] Total Trades = count of all trades (or demo count).
- [ ] Win rate % and Average R look correct vs journal.
- [ ] Total PnL matches sum of closed-trade PnLs.
- [ ] Profit factor shows a number or “—”, never “Infinity” or “NaN”.
- [ ] Equity curve increases/decreases with cumulative PnL.
- [ ] Performance by pair/session only show pairs/sessions that have trades (no empty bars for unused sessions).

### Journal
- [ ] Same trades as Overview; filters (pair, result, session, direction) work.
- [ ] PnL and numbers use consistent formatting (e.g. $ and %).
- [ ] Opening a trade shows detail sheet with same numbers (risk amount, PnL, R multiple, checklist, grade).

### Analytics
- [ ] Total trades, win rate, avg R, total PnL match Overview.
- [ ] Expectancy (R), max drawdown, consistency score are numbers or “—”.
- [ ] Longest win/loss streaks are integers.
- [ ] Equity and PnL-by-pair/session charts match Overview data.

### Leaderboard
- [ ] In test mode with demo data: one row (e.g. Shubz) with totals from demo trades.
- [ ] Win rate, PnL, avg R, profit factor, consistency use same logic as Overview/Analytics.
- [ ] Sort by PnL / win rate / avg R changes order; no NaN in cells.

---

## 4. Quick smoke test (no data)

1. Clear or disable demo trades (e.g. set `BYPASS_AUTH` false and use no user, or use empty trade list).
2. Open **Overview** and **Analytics**: KPIs should show 0 or “—”, charts “No data yet” or empty state, no errors.
3. Open **Leaderboard**: “No community data yet” or empty table.
4. Open **Calculator**: Enter valid numbers; calculated fields should still compute and show no NaN.

---

## 5. Files involved (for reference)

- **Calculator:** `lib/trade-calculations.ts`, `lib/config/auraAnalysisAssets.ts`, `components/forms/TradeCalculatorForm.tsx`
- **KPIs / charts:** `lib/analytics/kpis.ts`, `lib/analytics/chartDatasets.ts`, `lib/analytics/drawdown.ts`, `lib/analytics/streaks.ts`, `lib/analytics/consistency.ts`
- **Formatting:** `lib/utils.ts` (`formatCurrencySafe`, `formatPercentSafe`, `formatRSafe`, `formatDistance`, `formatRR`, `formatPositionSize`)
- **Overview:** `app/aura-analysis/page.tsx`, `app/aura-analysis/OverviewClient.tsx`
- **Analytics:** `app/aura-analysis/analytics/page.tsx`, `app/aura-analysis/analytics/AnalyticsClient.tsx`
- **Leaderboard:** `app/aura-analysis/leaderboard/page.tsx` (uses `buildKpiSummary` + `consistencyScore`)

Using this order and these five calculator scenarios, you can verify that the whole dashboard is numerically correct and consistent.
