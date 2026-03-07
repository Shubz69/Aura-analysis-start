# Full UI & functionality audit (test mode)

**Audit date:** After test mode implementation.  
**Condition:** `NEXT_PUBLIC_BYPASS_AUTH=true` set at build time (e.g. in `.env.local` or Vercel env).

---

## 1. Dashboard opens directly

| Check | Status | Notes |
|-------|--------|--------|
| Root (`/`) redirects to dashboard when bypass is on | **PASS** | `app/page.tsx`: `if (BYPASS_AUTH) redirect(DASHBOARD_ROUTE)` → `/aura-analysis`. |
| No landing page shown in test mode | **PASS** | Redirect happens in server component before any landing UI. |
| No "Sign in on main site" / login CTAs in test mode | **PASS** | User never sees root; redirect is immediate. |

**Caveat:** `BYPASS_AUTH` is derived from `process.env.NEXT_PUBLIC_BYPASS_AUTH` at **build time**. For the redirect to work, the app must be built (or rebuilt) with `NEXT_PUBLIC_BYPASS_AUTH=true` in the environment. Local: set in `.env.local` and run `npm run dev`. Vercel: add the env var and redeploy.

---

## 2. No login/auth blockers remain

| Check | Status | Notes |
|-------|--------|--------|
| AuthProvider does not redirect when BYPASS_AUTH | **PASS** | `AuthProvider.tsx`: when `BYPASS_AUTH`, sets mock user + `allowed=true`, skips `/api/aura-analysis/me`, and the effect that does `window.location.href = getMainLoginUrl(...)` does not run (`if (BYPASS_AUTH) return`). |
| Dashboard layout does not block render | **PASS** | `DashboardLayoutClient` shows "Checking session..." only while `loading`; with bypass, `loading` becomes false immediately with mock user. |
| /login and /signup do not send user off-site in test mode | **PASS** | Both redirect to `/aura-analysis` when `BYPASS_AUTH`. |
| No JWT or token required to open dashboard | **PASS** | When bypass is on, no token is read and no `/me` call is made. |

---

## 3. Journal page vs main Aura FX style

| Check | Status | Notes |
|-------|--------|-------|
| Dark, card-based layout | **PASS** | Root has `className="dark"`; journal table wrapped in `Card className="glass"` (same as Overview/Analytics/Leaderboard). |
| Clean table with borders | **PASS** | shadcn `Table` inside Card; `border-border`, `rounded-md`, `overflow-hidden`. |
| Search + filters (pair, result, direction, session) | **PASS** | Input + four Selects; filters and pagination work. |
| Row click opens detail drawer | **PASS** | `TradeDetailSheet` with `initialTrade` from journal list; no API needed in test mode. |
| PnL and R columns styled (color) | **PASS** | PnL uses `text-emerald-500` / `text-red-500`; R uses `formatNumber`. |
| Spacing and typography | **PASS** | `space-y-4` for sections; consistent `TableHead` / `TableCell`; `formatCurrency` / `formatNumber` from `@/lib/utils`. |

**Note:** Main Aura FX uses MUI + horizontal tabs and may use #0a0a0a / Space Grotesk. This app uses Tailwind + shadcn + Inter and CSS variables (e.g. `--background`, `--card`). The journal is aligned in structure (filters, table, detail drawer) and dark card styling; exact pixel/font match would require sharing the same design tokens or Aura FX CSS.

---

## 4. Charts clean and polished

| Check | Status | Notes |
|-------|--------|-------|
| Recharts used | **PASS** | `EquityCurveChart`, `PerformanceByPairChart`, `SessionChart` use Recharts. |
| Dark-theme compatible | **PASS** | Axes and grid use `hsl(var(--muted-foreground))`, `stroke-border`; gradient and bars use `hsl(var(--primary))`. |
| Tooltips styled | **PASS** | All three charts use `Tooltip` with `contentStyle`: `backgroundColor: hsl(var(--card))`, `border`, `borderRadius`. |
| Card containers | **PASS** | Overview and Analytics wrap charts in `Card className="glass overflow-hidden"`. |
| Empty state | **PASS** | Each chart shows a short message when `data.length === 0`. |

---

## 5. Calculator numbers correct

| Check | Status | Notes |
|-------|--------|-------|
| Calculation engine location | **PASS** | `lib/trade-calculations.ts`: pip multipliers (forex/JPY/metals/indices/crypto), `calcRiskAmount`, `calcStopLossDistance`, `calcTakeProfitDistance`, `calcRR`, `calcPositionSize`, `calcPotentialProfit` / `calcPotentialLoss`, `calcTradePnL`, `calcRMultiple`, `calcChecklistPercent`, `calcTradeGrade`. |
| Risk amount | **PASS** | `balance * riskPercent / 100`. |
| SL/TP pips | **PASS** | `|entry - stop| * pipMultiplier` (JPY/metals/indices/crypto use correct multipliers). |
| RR | **PASS** | `calcRR`: reward distance / risk distance. |
| Position size | **PASS** | `riskAmount / (slPips * pipValue)` with correct pip value for JPY vs standard lots. |
| Potential PnL | **PASS** | Uses pip distance × pip value × position size. |
| Form uses engine | **PASS** | `TradeCalculatorForm` imports and uses the above functions for live outputs. |

---

## 6. Analytics metrics populated

| Check | Status | Notes |
|-------|--------|-------|
| When BYPASS_AUTH, analytics uses DEMO_TRADES | **PASS** | `app/aura-analysis/analytics/page.tsx`: `tradeList = BYPASS_AUTH ? DEMO_TRADES : []`. |
| Stats computed from trades | **PASS** | `totalTrades`, `winRate`, `averageR`, `totalPnL`, `profitFactor`, `expectancy`, `maxDrawdown`, `longestWinStreak`, `longestLossStreak`, `averageChecklistPercent`, `consistencyScore` from `lib/analytics`. |
| Equity / pair / session charts from same data | **PASS** | `buildEquityCurve`, `pairPnL`, `sessionPnL` used; charts receive non-empty data in test mode. |

---

## 7. Leaderboard renders properly

| Check | Status | Notes |
|-------|--------|-------|
| When BYPASS_AUTH, rows from DEMO_TRADES | **PASS** | `app/aura-analysis/leaderboard/page.tsx`: one row "Shubz" with metrics from `DEMO_TRADES`. |
| LeaderboardClient receives rows | **PASS** | `rows` and `isAdmin={BYPASS_AUTH}` passed. |
| Sort and table UI | **PASS** | `LeaderboardClient` has sort dropdown and table; Card with `glass`. |

---

## 8. No broken redirects

| Check | Status | Notes |
|-------|--------|-------|
| Root → /aura-analysis (when bypass) | **PASS** | Server redirect. |
| /login, /signup → /aura-analysis (when bypass) | **PASS** | Server redirect. |
| Dashboard internal links | **PASS** | All nav and links use `/aura-analysis/*` (Overview, Calculator, Journal, Analytics, Leaderboard, etc.). |
| No redirect to auraxfx.com in test mode | **PASS** | Redirect effect in AuthProvider is skipped when `BYPASS_AUTH`; login/signup redirect to `/aura-analysis`. |

---

## 9. No Supabase remnants

| Check | Status | Notes |
|-------|--------|-------|
| No supabase imports in app code | **PASS** | Grep: no matches in `.ts`/`.tsx`/`.js`/`.jsx`. |
| No NEXT_PUBLIC_SUPABASE_* in app code | **PASS** | None. |
| No ConfigRequired / createClient | **PASS** | None. |

---

## 10. No wrong domain references

| Check | Status | Notes |
|-------|--------|-------|
| No aura-fx.com in app code | **PASS** | Grep: no matches in app source. Only `auraxfx.com` in `lib/appConfig.ts` (correct). |
| Docs that mention aura-fx.com | **OK** | Only in `docs/LOGIN_REDIRECT_AND_DOMAIN_FIX.md` as "replaced with auraxfx.com". |

---

## Route to open first for testing

**With test mode enabled (`NEXT_PUBLIC_BYPASS_AUTH=true` at build):**

1. **Preferred:** Open the **app root**:
   - **Local:** `http://localhost:3000`
   - **Deployed:** `https://aura-analysis-start.vercel.app` (or your Vercel URL)
   - You are **redirected to `/aura-analysis`** (Overview). No login, no landing.

2. **Alternative:** Open the dashboard route directly:
   - **Local:** `http://localhost:3000/aura-analysis`
   - **Deployed:** `https://aura-analysis-start.vercel.app/aura-analysis`
   - You see the Overview page immediately (same as after redirect from root).

**Summary:** Open **`/`** (root) first; the app will send you to **`/aura-analysis`**. If you bookmark the dashboard, you can also open **`/aura-analysis`** directly. Both are valid; the first route to use for a full test is the **root URL** of the app.
