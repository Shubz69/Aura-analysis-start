# Aura Analysis Free Manual Dashboard — Final Output

## 1. Project file tree

```
aura-analysis-manual/
├── api/
│   ├── db.js
│   ├── utils/
│   │   └── auth.js
│   └── aura-analysis/
│       ├── me.js
│       ├── assets/
│       │   └── index.js
│       ├── trades/
│       │   ├── index.js
│       │   └── [id].js
│       ├── analytics/
│       │   ├── overview.js
│       │   ├── performance.js
│       │   └── leaderboard.js
│       ├── checklists/
│       │   └── index.js
│       └── admin/
│           └── overview.js
├── database/
│   ├── database_aura_analysis.sql      # Migration (all aura_analysis_* tables)
│   ├── database_aura_analysis_seed.sql # Seed: assets, checklist, demo trades
│   ├── migrations/
│   │   └── 001_aura_analysis_tables.sql
│   └── seed/
│       ├── 001_aura_analysis_assets.sql
│       ├── 002_aura_analysis_checklist.sql
│       └── 003_demo_trades.sql
├── docs/
│   ├── ARCHITECTURE_SUMMARY.md
│   ├── AUTH_AND_TESTING.md             # Existing auth only; how to test
│   ├── REPOSITORY_SCAN.md
│   └── FINAL_OUTPUT.md                 # This file
├── src/
│   ├── index.js
│   ├── App.js
│   ├── theme.js
│   ├── index.css
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── auraAnalysisCalculations.js
│   ├── components/
│   │   └── aura-analysis/
│   │       ├── layout/
│   │       │   ├── DashboardLayout.js
│   │       │   └── ProtectedRoute.js
│   │       └── tables/
│   │           └── TradeDetailDrawer.js
│   ├── pages/
│   │   └── aura-analysis/
│   │       ├── LoginPage.js
│   │       ├── OverviewPage.js
│   │       ├── CalculatorPage.js
│   │       ├── JournalPage.js
│   │       ├── AnalyticsPage.js
│   │       ├── LeaderboardPage.js
│   │       ├── ChecklistsPage.js
│   │       ├── ProfilePage.js
│   │       └── AdminPage.js
│   └── styles/
│       └── aura-analysis/
│           └── AuraDashboard.css
├── .env.example
├── package.json
├── vercel.json
└── README.md
```

## 2. SQL migration file

- **Path:** `database/database_aura_analysis.sql`
- **Contents:** Creates tables (MySQL, InnoDB, utf8mb4):
  - `aura_analysis_assets`
  - `aura_analysis_trades` (FK to `users(id)` ON DELETE CASCADE, FK to `aura_analysis_assets(id)` ON DELETE SET NULL)
  - `aura_analysis_checklist_templates`
  - `aura_analysis_checklist_template_items` (FK to templates ON DELETE CASCADE)
  - `aura_analysis_trade_checklist_items` (FK to trades ON DELETE CASCADE)
  - `aura_analysis_settings`
- **Prerequisite:** Existing `users` table with `id` (INT PK).

## 3. SQL seed file

- **Path:** `database/database_aura_analysis_seed.sql`
- **Contents:**
  - **Assets:** Forex majors/crosses, metals, oil/energy, indices, crypto (EURUSD, GBPUSD, USDJPY, XAUUSD, NAS100, US30, BTCUSD, ETHUSD, etc.).
  - **Default checklist template** and items: Trend aligned, Liquidity sweep confirmed, Session valid, Structure confirmed, Risk under max allowed, Confluence present, HTF bias aligned.
  - **Demo trades:** Set `@USER_ID = 1` (or your user id); inserts sample trades for EURUSD, GBPJPY, XAUUSD, NAS100, BTCUSD, etc. (win/loss mix for charts).

## 4. API route list

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/aura-analysis/me` | Bearer | Current user + allowed flag (uses existing JWT; no separate login API) |
| GET | `/api/aura-analysis/assets` | Free dashboard | List assets |
| GET | `/api/aura-analysis/trades` | Free dashboard | List trades (pair, result, session, direction, from, to, limit, offset) |
| POST | `/api/aura-analysis/trades` | Free dashboard | Create trade |
| GET | `/api/aura-analysis/trades/:id` | Free dashboard | Trade + checklist items |
| PUT | `/api/aura-analysis/trades/:id` | Free dashboard | Update trade |
| DELETE | `/api/aura-analysis/trades/:id` | Free dashboard | Delete trade |
| GET | `/api/aura-analysis/analytics/overview` | Free dashboard | KPIs, equity curve, recent trades |
| GET | `/api/aura-analysis/analytics/performance` | Free dashboard | Equity, drawdown, streaks, pair/session/grade stats |
| GET | `/api/aura-analysis/analytics/leaderboard` | Free dashboard | Rank, username, total trades, win rate, avg R, PnL, consistency, best pair |
| GET | `/api/aura-analysis/checklists` | Free dashboard | Templates + items |
| POST | `/api/aura-analysis/checklists` | Admin | Create template |
| GET | `/api/aura-analysis/admin/overview` | Admin | Dashboard stats, recent trades |

All use `api/db.js` (executeQuery/query) and `api/utils/auth.js` (requireFreeDashboardAccess, requireAdminAccess). Allowed roles: user, admin, super_admin. Blocked: premium, elite, a7fx. Override: `shubzfx@gmail.com` → super_admin.

## 5. New frontend page list

| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | Gate: "Log in on main site, then continue" (no separate auth; uses existing Aura FX session) |
| `/aura-analysis` | OverviewPage | KPIs, equity curve, checklist summary, recent trades |
| `/aura-analysis/calculator` | CalculatorPage | Pair, direction, entry/SL/TP, balance, risk %, session; outputs risk amount, SL/TP pips, RR, position size, potential P/L, grade; Save as trade |
| `/aura-analysis/journal` | JournalPage | Search, filters (pair, result, session, direction, date range), table, pagination, detail drawer (view/edit/delete) |
| `/aura-analysis/analytics` | AnalyticsPage | Equity curve, pair performance, session performance, grade distribution, key metrics |
| `/aura-analysis/leaderboard` | LeaderboardPage | Sort by PnL/win rate/avg R/trades/profit factor/consistency; rank table |
| `/aura-analysis/checklists` | ChecklistsPage | List checklist templates and items |
| `/aura-analysis/profile` | ProfilePage | User profile |
| `/aura-analysis/admin` | AdminPage | Admin overview (total users, trades, community metrics) |

## 6. Environment variables required

| Variable | Required | Description |
|----------|----------|-------------|
| `MYSQL_HOST` | Yes | MySQL host |
| `MYSQL_USER` | Yes | MySQL user |
| `MYSQL_PASSWORD` | Yes | MySQL password |
| `MYSQL_DATABASE` | Yes | Database name |
| `MYSQL_PORT` | No | Default 3306 |
| `MYSQL_SSL` | No | Set `true` for TLS |
| `DATABASE_URL` | No | Full URL (overrides MYSQL_* if set) |
| `JWT_SECRET` or `JWT_SIGNING_KEY` | Yes | JWT signing secret |
| `REACT_APP_API_URL` | No | API base URL (empty = proxy to same host) |

See `.env.example` in the project root.

## 7. Commands to run locally

```bash
cd aura-analysis-manual
npm install
```

**Option A — Frontend only (no API):**  
```bash
npm start
```
Runs React on http://localhost:3000. API calls will fail unless you set `REACT_APP_API_URL` to a deployed API or run Option B.

**Option B — Frontend + API (recommended):**  
1. Terminal 1 (API):  
   ```bash
   npm run api
   ```  
   Runs Vercel dev server on port 3001 (or `vercel dev --listen 3001`).

2. Terminal 2 (Frontend):  
   ```bash
   npm start
   ```  
   Runs React on port 3000. `package.json` has `"proxy": "http://localhost:3001"` so `/api/*` is proxied to the API.

**Auth:** Use the existing Aura FX login only. No separate login API. See **docs/AUTH_AND_TESTING.md** for testing with existing DB users.

## 8. Deploying to Vercel

1. Push the `aura-analysis-manual` app to a Git repo (or use the monorepo root and set root to `aura-analysis-manual` in Vercel).
2. In Vercel: New Project → Import repo → set **Root Directory** to `aura-analysis-manual` if needed.
3. Add environment variables (MYSQL_*, JWT_SECRET).
4. Build: Vercel uses `vercel.json`: `buildCommand: "npm run build"`, `outputDirectory: "build"`. Rewrites send non-API routes to `/index.html`.
5. Deploy. API routes under `api/` are deployed as serverless functions automatically.

## 9. Running SQL migrations in MySQL Workbench / Railway

1. **MySQL Workbench**  
   - Connect to your MySQL server.  
   - Open `database/database_aura_analysis.sql`.  
   - Execute the script (run all).  
   - Then open `database/database_aura_analysis_seed.sql`, set `@USER_ID` to a valid `users.id`, then execute.

2. **Railway**  
   - Use the MySQL plugin or an external MySQL client connected to Railway’s MySQL URL.  
   - Run the same two scripts in order: first migration, then seed.

**Order:**  
1. `database_aura_analysis.sql` (creates tables).  
2. `database_aura_analysis_seed.sql` (assets, checklist, optional demo trades).

## 10. Remaining TODOs

- **Auth:** No separate login. Aura Analysis uses existing Aura FX auth (users table + JWT). Test by logging in on the main site with a real user, then opening Aura Analysis. See **docs/AUTH_AND_TESTING.md**.
- **Optional:** Snackbar/toast for success messages (e.g. “Trade saved”) using MUI Snackbar or react-toastify.
- **Optional:** Admin “view full dataset” could be expanded with a dedicated admin trades list endpoint and page.
- **Integration:** When merging into Aura-FX, point frontend to Aura-FX API base, use Aura-FX Navbar and theme, and mount routes under `/aura-analysis/dashboard`.

---

This completes the MVP of the Aura Analysis Free Manual Dashboard: migration, seed, API routes, calculation engine, all pages, layout, charts, journal with filters and detail drawer (view/edit/delete), calculator with save, analytics and leaderboard, access control, and local/Vercel run instructions.
