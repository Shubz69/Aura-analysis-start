# Aura Analysis — FX Trader Dashboard

Production-ready trader analytics platform for manual trade journaling, calculations, discipline tracking, and community performance. Uses **existing Aura FX auth** and MySQL; no Supabase.

## Tech stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix)
- **MySQL** (existing Aura FX DB) + **JWT** (existing Aura FX auth)
- **Recharts**, **Zod**, **React Hook Form**, **Framer Motion**

---

## Run order for local setup

Run these steps in order.

### Step 1 — Clone and install

```bash
cd "c:\Users\1230s\OneDrive\Documents\Samy\Aura Analysis start\Aura-analysis-start"
npm install
```

### Step 2 — Environment

Copy `.env.example` to `.env.local` and set:

- **JWT** (same as main Aura FX site): `JWT_SECRET` or `JWT_SIGNING_KEY`
- **Database** (same MySQL as main app): `DATABASE_URL` or `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

Optional:

- `NEXT_PUBLIC_MAIN_LOGIN_URL` — main site login URL (where unauthenticated users are sent)
- `NEXT_PUBLIC_AUTH_TOKEN_KEY` — storage key for JWT (default `"token"`; must match main site)

### Step 3 — Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **Sign in on the main Aura FX site** first; then open this app. The app will use the same session (JWT) and redirect to the main login if not authenticated.

---

## Auth (Aura FX only)

- This app **does not have its own signup or login**. It uses the existing Aura FX website login and JWT.
- Token is read from `localStorage`/`sessionStorage` (key from `NEXT_PUBLIC_AUTH_TOKEN_KEY`).
- The app calls `/api/aura-analysis/me` to validate the token and load the user from the existing **users** table.
- Allowed roles: `user`, `admin`, `super_admin`. Blocked: `premium`, `elite`, `a7fx`. See `docs/AUTH_FIX_SUMMARY.md` and `docs/RLS_AND_SETUP.md`.

---

## Commands

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | Run ESLint               |
| `npm run test` | Run calculation tests    |

## Project structure

- **`app/`** — App Router pages (dashboard, auth callback, dashboard sub-routes). `/login` and `/signup` redirect to the main site.
- **`components/`** — UI and dashboard components (`ui/`, `dashboard/`, `charts/`, `forms/`, `trades/`), including `AuthProvider` for JWT bootstrap.
- **`lib/`** — Utilities: `calculators/` (risk engine), `instruments.ts`, `analytics/`, `auth.js`, `db.js`, `validations/`.
- **`types/`** — Shared TypeScript types.
- **`hooks/`** — React hooks (e.g. `useProfile`).
- **`app/api/aura-analysis/`** — API routes (`me`, etc.) using MySQL + JWT auth.

## Key files to review

1. **`lib/calculators/`** — Risk calculation engine: `calculateRisk`, instrument-based (forex, commodity, index, stock, futures, crypto); closed-trade PnL in `closedTradePnL.ts`.
2. **`lib/analytics/metrics.ts`** — Win rate, profit factor, drawdown, streaks, consistency.
3. **`lib/validations/trade.ts`** — Zod schemas for calculator and trade result.
4. **`lib/auth.js`** / **`app/api/aura-analysis/me/route.ts`** — JWT validation and current user from existing DB.
5. **`components/forms/TradeCalculatorForm.tsx`** — Calculator form and live calculations.

## Calculator asset support

The trade calculator uses **`lib/calculators/`** and **`lib/instruments.ts`** (single source of truth):

- **Forex:** Pips, lot size, JPY handling.
- **Commodities / metals / energy:** XAUUSD, XAGUSD, XTIUSD, XBRUSD (contract size, points).
- **Indices:** US30, NAS100, SPX500, GER40 (value per point per lot).
- **Stocks, futures, crypto:** Shares, contracts, units per instrument spec.

Unknown symbols use fallbacks from `lib/instruments.ts`. Asset list for the dropdown comes from `lib/config/auraAnalysisAssets.ts` or the DB.

## Testing

Calculation tests cover:

- EURUSD, GBPJPY, XAUUSD, US30, BTCUSD (balance/risk scenarios)
- Trade grade and checklist percent helpers

Run:

```bash
npm run test
```

## Extending

- **Trades / profile data:** Wire dashboard pages to your existing API (e.g. `/api/aura-analysis/trades`) using the same JWT and `lib/auth.js`.
- **MT5/API sync:** Add API routes that use `lib/calculators/calculateRisk` and `lib/calculators/closedTradePnL` and insert/update trades in your DB.
- **Leaderboard / checklist:** Load from your MySQL or API; admin UI can use role from `/api/aura-analysis/me`.
