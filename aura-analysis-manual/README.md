# Aura Analysis – FREE Manual Trading Dashboard

**Manual-only** dashboard for free members. All trades are entered by the user; no MT5, broker API, TradingView sync, VPS sync, or automatic trade import. Automated/account syncing is reserved for a future paid AI version. See **docs/PRODUCT_SCOPE.md**.

Production-ready: existing MySQL + JWT auth; tables with prefix `aura_analysis_`. **JavaScript only. No Supabase, TypeScript, Tailwind, or Prisma.**

## Repository alignment

This app is aligned with **[Shubz69/Aura-FX](https://github.com/Shubz69/Aura-FX)** so it can be merged into `/aura-analysis/dashboard`. See **REPO_ALIGNMENT.md** for:

- API route structure (`executeQuery`, `verifyToken`)
- Auth and role patterns (allowed/blocked, `shubzfx@gmail.com` override)
- Styling (AuraDashboard.css, Space Grotesk, #0a0a0a / purple)
- Response shapes (`success`, `errorCode`, `message`)

## Stack

- **Frontend:** React (Create React App), **JavaScript only**, MUI + Emotion + custom CSS (no Tailwind)
- **Backend:** Node.js **Vercel serverless** API under `/api/aura-analysis/**`
- **Database:** MySQL (Railway), **raw SQL via mysql2** through `api/db.js` (same interface as Aura-FX)
- **Auth:** `api/utils/auth.js`; JWT `verifyToken` + `users` table; same pattern as Aura-FX
  - **Allowed roles:** `user`, `admin`, `super_admin`
  - **Blocked roles:** `premium`, `elite`, `a7fx`
  - **Super admin override:** `shubzfx@gmail.com` is always treated as `super_admin` regardless of DB role

## Environment variables

Create `.env` in `aura-analysis-manual/` (and in Vercel if you deploy):

```env
# MySQL (use one of the two)
DATABASE_URL=mysql://user:pass@host:3306/dbname
# or
MYSQL_HOST=...
MYSQL_USER=...
MYSQL_PASSWORD=...
MYSQL_DATABASE=aura

# JWT (must match your main app)
JWT_SECRET=your-jwt-secret
```

**Frontend (optional):**  
`REACT_APP_API_URL` – leave empty when using CRA proxy in dev.

---

## Exact SQL execution order

Run in this order (from repo root or from `aura-analysis-manual`):

```bash
# 1) Migration – creates all aura_analysis_* tables (requires existing users table)
mysql -h YOUR_HOST -u YOUR_USER -p YOUR_DATABASE < aura-analysis-manual/database/migrations/001_aura_analysis_tables.sql

# 2) Seed assets (forex, metals, energy, indices, crypto)
mysql -h YOUR_HOST -u YOUR_USER -p YOUR_DATABASE < aura-analysis-manual/database/seed/001_aura_analysis_assets.sql

# 3) Seed default checklist template and items
mysql -h YOUR_HOST -u YOUR_USER -p YOUR_DATABASE < aura-analysis-manual/database/seed/002_aura_analysis_checklist.sql

# 4) Optional: demo trades for local testing (edit @USER_ID in the file first)
mysql -h YOUR_HOST -u YOUR_USER -p YOUR_DATABASE < aura-analysis-manual/database/seed/003_demo_trades.sql
```

Or paste each file’s contents into your MySQL client in the same order.

---

## Exact local setup steps

1. **Clone / open repo** and go to the manual app folder:
   ```bash
   cd aura-analysis-manual
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env`** in `aura-analysis-manual/` with `MYSQL_*` or `DATABASE_URL` and `JWT_SECRET`.

4. **Run SQL** in order (see “Exact SQL execution order” above).

5. **Start the API** (Vercel dev server on port 3001):
   ```bash
   npm run api
   ```

6. **In a second terminal**, start the React app (port 3000; proxies `/api` to 3001):
   ```bash
   npm start
   ```

7. **Open** `http://localhost:3000`. Log in via the login page (see “Login” below).

---

## Login

The app uses **GET /api/aura-analysis/me** with the JWT (from `Authorization: Bearer <token>` or cookie). Aura Analysis does not have its own login API. You must log in on the **main Aura FX site** first. Either:

- Open Aura Analysis after logging in on the main site; token key default `token` (or set `REACT_APP_AUTH_TOKEN_KEY`).

The token is read from the same storage key as the main app (default `token`) (or use your existing cookie). The dashboard calls `/api/aura-analysis/me` and loads the user from the **users** table (allowed roles only; blocked roles get a “manual users only” message).

---

## Files to inspect first

| Priority | File | Purpose |
|--------|------|--------|
| 1 | `api/utils/auth.js` | JWT, `getCurrentUserFromToken`, `requireFreeDashboardAccess`, `requireAdminAccess`, allowed/blocked roles, `shubzfx@gmail.com` → `super_admin` |
| 2 | `api/db.js` | MySQL pool, `query()` used by all API routes |
| 3 | `database/migrations/001_aura_analysis_tables.sql` | All `aura_analysis_*` tables and FKs |
| 4 | `api/aura-analysis/me.js` | Current user + access check |
| 5 | `api/aura-analysis/trades/index.js` | List/create trades |
| 6 | `api/aura-analysis/trades/[id].js` | Get/update/delete one trade |
| 7 | `src/utils/auraAnalysisCalculations.js` | Risk, position size, R, grade, consistency; supports forex, metals, energy, indices, crypto |
| 8 | `src/contexts/AuthContext.js` | User + allowed state, `refreshAuth` |
| 9 | `src/components/aura-analysis/layout/ProtectedRoute.js` | Guard for dashboard routes |
| 10 | `src/App.js` | Routes and layout wiring |

---

## Project status summary

- **Scope:** Manual-only. No MT5, broker API, TradingView, VPS, or automatic import (see **docs/PRODUCT_SCOPE.md**).
- **Auth:** JWT via `api/utils/auth.js`; allowed roles `user`, `admin`, `super_admin`; blocked `premium`, `elite`, `a7fx`; `shubzfx@gmail.com` override.
- **DB:** All tables use `aura_analysis_` prefix; raw MySQL through `api/db.js`; migrations and seeds run in order above.
- **API:** Vercel serverless under `/api/aura-analysis/` (me, assets, trades, analytics, checklists, admin); no Supabase/Prisma/Express.
- **Frontend:** CRA, JavaScript only; MUI + Emotion + custom CSS; no TypeScript/Tailwind; Recharts for charts.
- **Pages:** Overview (KPIs, equity curve, recent trades), Calculator, Journal (filters, detail drawer), Analytics, Leaderboard, Checklists, Profile, Admin (admin/super_admin only). Error, loading, and empty states added where relevant.
- **Calculations:** All requested asset classes supported (forex majors/minors, metals, energy, indices, crypto) in `src/utils/auraAnalysisCalculations.js`.

---

## Remaining issues / notes

1. **Auth:** No separate login. Use existing Aura FX login; token key must match main app. See **docs/AUTH_AND_TESTING.md**.
2. **Demo seed:** `003_demo_trades.sql` uses `@USER_ID = 1`. Replace with a real `users.id` from your DB (with role `user`, `admin`, or `super_admin`) before running.
3. **Consolidated SQL:** Run `database/database_aura_analysis.sql` then `database/database_aura_analysis_seed.sql`; see **docs/FINAL_OUTPUT.md**.
4. **Trade detail edit:** The trade detail drawer has an “Edit” button; wire it to an edit form/modal and `updateTrade(id, payload)` if you want in-place editing.

---

## Merge into main app

To serve this under `/aura-analysis/dashboard` in your main Aura FX app:

- Copy or mount the React build (or source) under that path.
- Use the same JWT and `users` table; keep the same `aura_analysis_*` tables and `/api/aura-analysis/*` routes.

---

## Trade grade

- 100% checklist → **A+**  
- 80–99% → **A**  
- 60–79% → **B**  
- &lt;60% → **C**

## Consistency score

Defined in `calcConsistencyScore` in `src/utils/auraAnalysisCalculations.js` (risk discipline, checklist quality, streak volatility, regularity).
