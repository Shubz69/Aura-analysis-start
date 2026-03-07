# Aura Analysis — FX Trader Dashboard

Production-ready trader analytics platform for manual trade journaling, calculations, discipline tracking, and community performance.

## Tech stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix)
- **Supabase** (Auth, Postgres, RLS)
- **Recharts**, **Zod**, **React Hook Form**, **Framer Motion**

---

## Exact run order for local setup

Run these steps in order. Do not skip steps.

### Step 1 — Clone and install

```bash
cd "c:\Users\1230s\OneDrive\Documents\Samy\Aura Analysis start\Aura-analysis-start"
npm install
```

### Step 2 — Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (note the project URL and anon key).
2. In the Supabase dashboard, open **SQL Editor**.
3. Run the **first migration** (copy-paste the full file contents, then Run):
   - File: `supabase/migrations/20240307000001_initial_schema.sql`
4. Run the **second migration**:
   - File: `supabase/migrations/20240307000002_rls.sql`
5. Run the **three seed files** in order:
   - `supabase/seed/seed_assets.sql`
   - `supabase/seed/seed_checklist.sql`
   - `supabase/seed/seed_settings.sql`
6. In **Authentication → Providers**, enable **Email**.
7. (Optional) To create an admin: sign up once in the app, then in **Table Editor → profiles** set that user’s `role` to `admin` or `super_admin`.

### Step 3 — Environment

```bash
copy .env.example .env.local
```

Edit `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` = your project URL (e.g. `https://xxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your project anon key

(Optional: `SUPABASE_SERVICE_ROLE_KEY` for running the seed script with service role.)

### Step 4 — Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up or sign in to reach the dashboard.

---

## Setup (detailed)

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run migrations **in this order**:
   - `supabase/migrations/20240307000001_initial_schema.sql`
   - `supabase/migrations/20240307000002_rls.sql`
3. Run seed SQL **in this order** in the SQL Editor:
   - `supabase/seed/seed_assets.sql`
   - `supabase/seed/seed_checklist.sql`
   - `supabase/seed/seed_settings.sql`
4. In Authentication → Providers, enable **Email**.
5. (Optional) Create an admin user: sign up normally, then in Table Editor → `profiles` set that user’s `role` to `admin` or `super_admin`.

### 3. Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` — project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key

Optional for seed script:

- `SUPABASE_SERVICE_ROLE_KEY` — service role key (bypasses RLS)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up or sign in to reach the dashboard.

## Commands

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | Run ESLint               |
| `npm run test` | Run calculation tests    |

## Project structure

- **`app/`** — App Router pages (dashboard, auth, dashboard sub-routes).
- **`components/`** — UI and dashboard components (`ui/`, `dashboard/`, `charts/`, `forms/`, `trades/`).
- **`lib/`** — Utilities: `trade-calculations.ts`, `analytics/`, `supabase/`, `validations/`.
- **`types/`** — Shared TypeScript types.
- **`hooks/`** — React hooks (e.g. `useProfile`).
- **`supabase/migrations/`** — Schema and RLS.
- **`supabase/seed/`** — Seed SQL and optional TS runner.

## Key files to review

1. **`lib/trade-calculations.ts`** — Pip/point logic, position size, PnL, R-multiple, grades.
2. **`lib/analytics/metrics.ts`** — Win rate, profit factor, drawdown, streaks, consistency.
3. **`lib/validations/trade.ts`** — Zod schemas for calculator and trade result.
4. **`supabase/migrations/`** — Tables and RLS policies.
5. **`components/forms/TradeCalculatorForm.tsx`** — Calculator form and live calculations.

## Manual Supabase steps

- Run the two migration files and three seed files in the SQL Editor (order above).
- Enable Email auth in Authentication → Providers.
- To promote a user to admin: update `profiles.role` to `admin` or `super_admin` for that user’s `id` (same as `auth.users.id`).

## RLS (Row Level Security)

RLS is configured in `supabase/migrations/20240307000002_rls.sql`. Summary:

- **Members:** Read/write own profile and trades only; read active checklist templates and assets.
- **Admins / super_admin:** Read all profiles and trades; manage assets, checklist templates, app_settings.
- **Super_admin only:** Can insert profiles (normally done by the `handle_new_user` trigger on signup).

If you need to re-apply or adjust policies, see **`docs/RLS_AND_SETUP.md`** for a step-by-step and manual policy checklist.

## Calculator asset support

The trade calculator and `lib/trade-calculations.ts` support:

- **Forex majors & minors:** Pip multiplier 10000 (or 100 for JPY pairs). All seeded symbols (e.g. EURUSD, GBPJPY) are in the asset registry and in the built-in defaults.
- **Commodities / metals / energy:** XAU (10), XAG (100), XTI, XBR, NATGAS (100).
- **Indices:** US30, NAS100, SPX500, GER40, UK100, FRA40, EU50, JP225, HK50, AUS200 (multiplier 1).
- **Crypto:** BTCUSD, ETHUSD, SOLUSD (multiplier 1).

Unknown symbols fall back to pattern-based defaults (JPY → 100, XAU → 10, indices/crypto → 1, else 10000). Seed data includes all requested majors, minors, metals, energy, indices, and crypto.

## Testing

Calculation tests cover:

- EURUSD (balance 10k, risk 1%, entry/SL/TP)
- GBPJPY (25k, 0.5%)
- XAUUSD (15k, 1%)
- US30 (20k, 1%)
- BTCUSD (12k, 1%)
- Trade grade and checklist percent helpers

Run:

```bash
npm run test
```

## Extending

- **MT5/API sync**: Add server actions or API routes that use the same `lib/trade-calculations` and insert/update `trades` and `trade_checklist_items`.
- **Leaderboard visibility**: Stored in `app_settings` under key `leaderboard_visibility`; admin UI can be added to toggle fields.
- **Checklist on save**: When saving a trade from the calculator, load a default checklist template and let the user tick items; then set `checklist_score`, `checklist_total`, `checklist_percent`, and `trade_grade` before insert.
