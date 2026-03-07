# Temporary test mode — deliverables

## 1. Auth/login files bypassed or disabled

| File | Change |
|------|--------|
| **lib/appConfig.ts** | Added `BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"`. |
| **components/AuthProvider.tsx** | When `BYPASS_AUTH`: sets mock user (Shubz, shubzfx@gmail.com, super_admin), `allowed=true`, `loading=false`; skips `/api/aura-analysis/me` and **does not redirect** to main site. |
| **app/page.tsx** | When `BYPASS_AUTH`: **redirects to `/aura-analysis`** immediately (no landing, no CTAs). |
| **app/login/page.tsx** | When `BYPASS_AUTH`: redirects to `/aura-analysis` (no main-site login). |
| **app/signup/page.tsx** | When `BYPASS_AUTH`: redirects to `/aura-analysis` (no main-site signup). |
| **components/HomeCTA.tsx** | Not shown when bypass is on (root redirects before render). |

No auth guards, no JWT checks, no auraxfx.com redirects when `NEXT_PUBLIC_BYPASS_AUTH=true`.

---

## 2. Route that opens first

- **With test mode (BYPASS_AUTH=true):** Opening `/` redirects to **`/aura-analysis`** (Overview). No landing page.
- **Without test mode:** `/` shows the landing page with “Sign in on main site” and “Open dashboard”.

---

## 3. Files that control dashboard layout

| File | Role |
|------|------|
| **app/aura-analysis/layout.tsx** | Wraps all `/aura-analysis/*` in `AuthProvider` and `DashboardLayoutClient`. |
| **app/aura-analysis/DashboardLayoutClient.tsx** | Shows “Checking session…” then `DashboardShell` with user email. |
| **components/dashboard/DashboardShell.tsx** | Sidebar, nav, main content area, sign out. |
| **components/dashboard/DashboardNav.tsx** | Nav links (Overview, Calculator, Journal, Analytics, Leaderboard, Checklists, Profile, Admin). |

---

## 4. Files that control journal page styling

| File | Role |
|------|------|
| **app/aura-analysis/journal/page.tsx** | Server page; passes `initialTrades` (demo when BYPASS_AUTH) and `openTradeId`. |
| **app/aura-analysis/journal/JournalClient.tsx** | Table, search, filters (pair, result, direction, **session**), pagination, row click → `TradeDetailSheet`. Uses shadcn Table, Select, Input; `formatCurrency` / `formatNumber` from `@/lib/utils`. |
| **components/trades/TradeDetailSheet.tsx** | Drawer with trade details; Edit/Delete (no API in test mode). |

---

## 5. Files that control the calculation engine

| File | Role |
|------|------|
| **lib/trade-calculations.ts** | **Main engine:** pip multiplier (forex/JPY/metals/indices/crypto), `getAssetMeta`, `calculatePips`, `calculatePositionSize`, `calculatePotentialPnL`, `calculateRMultiple`, etc. Used by calculator and trade grading. |
| **lib/trade-calculations.ts** (grades) | `calcChecklistPercent`, `calcTradeGrade` (checklist percent → letter grade). |
| **lib/analytics/** | **lib/analytics/metrics.ts**: win rate, profit factor, expectancy, drawdown, streaks, consistency score, pair/session PnL. **lib/analytics/equity.ts**: `buildEquityCurve`. |
| **components/forms/TradeCalculatorForm.tsx** | Uses trade-calculations for live risk amount, SL/TP pips, RR, position size, potential PnL. |

Calculation logic is in **lib/trade-calculations.ts** and **lib/analytics/**; reusable and shared by Overview, Analytics, Calculator, and Leaderboard.

---

## 6. Files that control chart components

| File | Role |
|------|------|
| **components/charts/EquityCurveChart.tsx** | Recharts `AreaChart`; equity over time; tooltip with currency; uses `--primary`, `--border`, `--card`, `--muted-foreground` (dark-theme compatible). |
| **components/charts/PerformanceByPairChart.tsx** | Recharts horizontal `BarChart`; PnL by pair; tooltip. |
| **components/charts/SessionChart.tsx** | Recharts `BarChart`; PnL by session; tooltip. |

Charts use CSS variables and existing tooltips; no separate “placeholder” components.

---

## 7. Where data comes from (DB vs mock vs fallback)

| Page / data | When BYPASS_AUTH=true | When BYPASS_AUTH=false |
|-------------|------------------------|-------------------------|
| **Overview** | `DEMO_TRADES` from **lib/demo-data.ts** (10 trades); KPIs, equity, pair/session charts, recent trades from that list. | Empty trade list; uses static `DEMO_EQUITY_CURVE`, `DEMO_PAIR_PNL`, `DEMO_SESSION_PNL`, `DEMO_RECENT_TRADES` for display only (KPIs stay 0). |
| **Journal** | `DEMO_TRADES` as `initialTrades`; table, filters, pagination, detail sheet. | `initialTrades=[]`; empty state. |
| **Analytics** | `DEMO_TRADES`; stats and charts from real metrics. | Empty; static demo curves. |
| **Leaderboard** | One row: “Shubz” with metrics computed from `DEMO_TRADES`. | Empty rows. |
| **Calculator** | No auth; form works. Save currently redirects to journal (no DB write in test mode). | Same. |
| **Profile / Admin / Checklists** | Rendered with empty or placeholder data. | Same. |

**Demo trades:** EURUSD, XAUUSD, GBPJPY, US30, BTCUSD, NAS100, etc.; win/loss/breakeven; London, New York, Asian, London/NY Overlap; multiple dates. Defined in **lib/demo-data.ts** as `DEMO_TRADES`.

---

## 8. Remaining issues / notes before testing

1. **Enable test mode:** Set **`NEXT_PUBLIC_BYPASS_AUTH=true`** in:
   - **Local:** `.env.local` then restart dev server.
   - **Vercel:** Project → Settings → Environment Variables → add `NEXT_PUBLIC_BYPASS_AUTH` = `true` → redeploy (so the value is inlined at build time).

2. **Turn off test mode later:** Remove or set `NEXT_PUBLIC_BYPASS_AUTH` to `false` and redeploy; auth and main-site redirects will work again.

3. **API /me:** Not called when BYPASS_AUTH is true; no need for JWT or DB for dashboard to load.

4. **TradeDetailSheet:** In test mode the journal passes the selected trade as `initialTrade`, so clicking a row opens the detail drawer with full trade data. No API call needed.

5. **Calculator “Save trade”:** Redirects to journal; no insert to DB in this app. Can be wired to your API later.

6. **Profile/Admin/Checklists:** Use empty or placeholder data; layout and navigation work.

---

## 9. Quick reference: enable test mode and open app

```bash
# Local
echo "NEXT_PUBLIC_BYPASS_AUTH=true" >> .env.local
npm run dev
# Open http://localhost:3000 → redirects to /aura-analysis
```

On Vercel: add `NEXT_PUBLIC_BYPASS_AUTH` = `true`, redeploy, then open the app URL → you go straight to the dashboard with demo data.
