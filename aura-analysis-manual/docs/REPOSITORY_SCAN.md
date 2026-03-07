# Repository Scan: Aura-FX + Aura Analysis

Scanned sources: **Aura-FX** (GitHub: Shubz69/Aura-FX) and **workspace** (aura-analysis-manual, app/, components/). Below is what exists and how Aura Analysis should integrate.

---

## 1. Existing MUI theme configuration

### Aura-FX (main repo)

- **Entry:** `src/index.js` renders `<App />` (no ThemeProvider in the fetched snippet; theme may be inside App or a wrapper).
- **App.js** imports Navbar, RouteGuards, lazy-loaded pages; no explicit `createTheme` in the fetched App snippet.

### Aura Analysis manual (this app)

- **File:** `src/theme.js`
- **Export:** `auraTheme` from `createTheme()`
- **Usage:** `src/App.js` wraps the app with `<ThemeProvider theme={auraTheme}>` and `<CssBaseline />`.

```javascript
// aura-analysis-manual/src/theme.js (current)
export const auraTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8B5CF6' },
    secondary: { main: '#7C3AED' },
    success: { main: '#22c55e' },
    error: { main: '#f87171' },
    background: { default: '#0f0f23', paper: '#1a1a2e' },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
  components: {
    MuiDrawer: { styleOverrides: { paper: { backgroundColor: '#0f0f23', borderRight: '1px solid rgba(139, 92, 246, 0.2)' } } },
    MuiAppBar: { styleOverrides: { root: { backgroundColor: '#1a1a2e', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' } } },
    MuiCard: { styleOverrides: { root: { backgroundColor: '#1a1a2e', border: '1px solid rgba(139, 92, 246, 0.15)' } } },
  },
});
```

- **Aura-FX dashboard CSS** (`src/styles/aura-analysis/AuraDashboard.css`) uses **#0a0a0a** and **Space Grotesk**; manual app uses **#0f0f23 / #1a1a2e** and Inter. For full alignment with Aura-FX, theme and CSS should match (e.g. #0a0a0a and Space Grotesk).

---

## 2. Dashboard layout components

### Aura-FX (main repo)

- **File:** `src/pages/aura-analysis/AuraDashboardLayout.js`
- **Structure:**
  - Imports `../../styles/aura-analysis/AuraDashboard.css`
  - Base path: `const base = '/aura-analysis/dashboard'`
  - Tabs: Overview, Performance, Risk Lab, Edge Analyzer, Execution Lab, Calendar, Psychology, Growth
  - Back link: “← Connection Hub”
  - Tab links: `NavLink` with `className={aura-dashboard-tab ${isActive ? 'active' : ''}}`, `end={path === 'overview'}`
  - Content: `<Outlet />` inside a content wrapper
- **Shell:** Sticky tab bar (`.aura-dashboard-tabs-wrap`), constrained content (`.aura-dashboard-content`), no MUI Drawer in this layout.

### Aura Analysis manual (this app)

- **File:** `src/components/aura-analysis/layout/DashboardLayout.js`
- **Structure:**
  - MUI **Drawer** (sidebar) + **AppBar** + **Box** main content
  - Imports `../../../styles/aura-analysis/AuraDashboard.css` and uses `className="aura-dashboard"`
  - **Nav:** List of `ListItemButton` + `NavLink` (Overview, Calculator, Journal, Analytics, Leaderboard, Checklists, Profile; Admin if `isAdmin`)
  - **Outlet** in main content area; responsive (drawer temporary on mobile)
- **Difference:** Aura-FX uses horizontal tabs; manual app uses a vertical sidebar. For integration, either reuse Aura-FX’s tab layout and add “Free” tabs (e.g. Overview, Calculator, Journal, …) or keep sidebar but reuse the same CSS and shell classes so the look matches.

### Other (workspace root)

- **app/dashboard/layout.tsx** – Next.js layout (TypeScript); not MUI.
- **components/dashboard/DashboardNav.tsx** – Next.js + Tailwind + Lucide; `/dashboard/*` routes. Different stack from Aura-FX CRA app.

---

## 3. Navigation / sidebar components

### Aura-FX (main repo)

- **Navbar:** `src/components/Navbar` (imported in App.js) – global top nav.
- **Aura dashboard:** In-page tab bar only (no sidebar) in `AuraDashboardLayout.js`; tabs are the navigation.
- **Route guards:** `CommunityGuard`, `SubscriptionPageGuard`, `PremiumAIGuard`, `AdminGuard`, `AuthenticatedGuard` in `src/components/RouteGuards`.
- **Aura-specific guard:** `AuraDashboardGuard` (`src/pages/aura-analysis/AuraDashboardGuard.js`) – uses `useAuth` and `useCanEnterAuraDashboard`; redirects if user cannot enter dashboard.

### Aura Analysis manual (this app)

- **Sidebar:** Implemented inside `DashboardLayout.js` (MUI `Drawer` + `List` of `ListItemButton` + `NavLink`).
- **Protected route:** `ProtectedRoute.js` – calls `getMe()`, redirects to `/login` if no user, shows “denied” if not allowed for free dashboard.
- **No global Navbar** in the standalone app; layout is dashboard-only.

### Integration

- Use Aura-FX **Navbar** when merged so the main site header is consistent.
- Use either Aura-FX **tab bar** (add Free Manual tabs) or keep the manual app **sidebar** but style it with Aura-FX CSS and theme so it feels like one product.

---

## 4. API route examples using api/db.js

### Aura-FX (main repo)

**api/db.js**

- **Exports:** `getDbPool`, `executeQuery`, `getDbConnection`, `executeTransaction`, etc.
- **executeQuery(query, params = [], options = {})** returns **`[rows, fields]`** (same as mysql2 `execute()`).
- **Usage:** `const [rows] = await executeQuery('SELECT ...', [params]);`

**api/me.js**

```javascript
const { executeQuery } = require('./db');
const { verifyToken } = require('./utils/auth');
const { applyScheduledDowngrade } = require('./utils/apply-scheduled-downgrade');
// ...
const decoded = verifyToken(req.headers.authorization);
if (!decoded || !decoded.id) return res.status(401).json({ success: false, errorCode: 'UNAUTHORIZED', message: '...' });
const userRow = await applyScheduledDowngrade(userId);  // SELECT * FROM users WHERE id = ?
// ... getEntitlements(userRow), then return res.status(200).json({ success: true, user, entitlements });
```

**api/journal/trades.js**

```javascript
const { executeQuery } = require('../db');
const { verifyToken } = require('../utils/auth');
// ...
const decoded = verifyToken(req.headers.authorization);
if (!decoded || !decoded.id) return res.status(401).json({ success: false, message: 'Authentication required' });
const userId = Number(decoded.id);
// ...
const [rows] = await executeQuery('SELECT * FROM journal_trades WHERE userId = ?', [userId]);
return res.status(200).json({ success: true, trades: rows.map(mapRow) });
// POST: executeQuery('INSERT INTO journal_trades (...) VALUES (...)', [...]);
```

### Aura Analysis manual (this app)

- **api/db.js** – Exposes **executeQuery** (returns `[rows, fields]`) and **query** (returns `rows` only) for compatibility.
- **api/aura-analysis/me.js** – Uses `getCurrentUserFromToken(req, db)` from `api/utils/auth.js`; does **not** use `executeQuery` directly; auth helper uses `db.query`.
- **api/aura-analysis/trades/index.js** – Uses `requireFreeDashboardAccess(req, res, db, async (user) => { ... })`; inside callback uses `db.query` for SELECT/INSERT.
- **api/aura-analysis/analytics/overview.js** – Same pattern: `requireFreeDashboardAccess` then `db.query(...)`.

So: Aura-FX routes use **verifyToken** + **executeQuery**; Aura Analysis routes use **requireFreeDashboardAccess** (which uses **verifyToken** + **db.query**). When merging, Aura Analysis should use the repo’s **executeQuery** and **verifyToken**; the “free dashboard” role check can stay in a small helper that uses `executeQuery` to load the user row.

---

## 5. Auth middleware usage from api/utils/auth.js

### Aura-FX (main repo)

- **api/utils/auth.js** exports:
  - **verifyToken(authHeader)** – returns decoded payload (with `id`) or `null`; no DB call.
  - **signToken**, **decodeTokenUnsafe**.
- **No** “requireAuth” or “getCurrentUserFromToken” in auth.js; each route:
  1. Calls `verifyToken(req.headers.authorization)`.
  2. If missing/invalid → 401.
  3. Uses `decoded.id` and fetches user/entitlements (e.g. via `applyScheduledDowngrade` or direct `executeQuery`).

### Aura Analysis manual (this app)

- **api/utils/auth.js** (dashboard-specific) adds:
  - **verifyToken(authHeader)** – same interface as Aura-FX.
  - **getCurrentUserFromToken(req, db)** – verifyToken + `db.query('SELECT id, email, username, role FROM users WHERE id = ?', [decoded.id])`; applies **shubzfx@gmail.com → super_admin**.
  - **requireAuth(req, res, db)** – returns user or sends 401.
  - **requireFreeDashboardAccess(req, res, db, callback)** – requireAuth + allowed roles (user, admin, super_admin) and blocks (premium, elite, a7fx); then runs `callback(user)`.
  - **requireAdminAccess(req, res, db, callback)** – requireAuth + admin or super_admin only.
  - **getEffectiveRole**, **isSuperAdminOverride**, **ALLOWED_ROLES**, **BLOCKED_ROLES**.

So: Aura-FX uses **verifyToken** only; Aura Analysis adds **middleware-style** helpers that use **verifyToken** + DB and role checks. When merged, the repo keeps a single **api/utils/auth.js** (verifyToken only); Aura Analysis can live in **api/aura-analysis/** and use a local helper that calls repo’s **verifyToken** and **executeQuery** to implement **getCurrentUserFromToken** and **requireFreeDashboardAccess** (or move those helpers into a shared util used only by aura-analysis routes).

---

## 6. Users table schema

There is **no** single “database_schema.sql” in the scanned Aura-FX repo; the **users** table is inferred from usage.

### Inferred from Aura-FX code

- **api/me.js** (user object built from userRow): `id`, `email`, `username`, `name`, `avatar`, `banner`, `role`, `level`, `xp`, `timezone`.
- **api/utils/apply-scheduled-downgrade.js**: `id`, `cancel_at_period_end`, `downgrade_to_plan`, `subscription_expiry`, `subscription_plan`, `role`, `subscription_status`, `onboarding_accepted`.
- **api/utils/entitlements.js** (getTier, getEntitlements, etc.): `role`, `subscription_plan`, `subscription_status`, `subscription_expiry`, `payment_failed`, `onboarding_accepted`, `onboarding_subscription_snapshot`.

**Minimal users schema (MySQL) inferred:**

| Column                         | Type / notes        |
|--------------------------------|---------------------|
| id                             | INT (PK)            |
| email                          | VARCHAR             |
| username                       | VARCHAR (nullable)  |
| name                           | VARCHAR (nullable)  |
| role                           | VARCHAR (e.g. user, admin, super_admin, premium, elite, a7fx) |
| avatar                         | VARCHAR/TEXT (nullable) |
| banner                         | VARCHAR/TEXT (nullable) |
| level                          | INT (default 1)     |
| xp                             | NUMERIC (default 0) |
| timezone                       | VARCHAR (nullable)  |
| subscription_plan              | VARCHAR (nullable) |
| subscription_status            | VARCHAR (nullable)  |
| subscription_expiry            | DATETIME (nullable) |
| payment_failed                 | BOOLEAN (nullable)  |
| onboarding_accepted            | BOOLEAN (nullable)  |
| onboarding_subscription_snapshot | VARCHAR (nullable) |
| cancel_at_period_end           | BOOLEAN (default FALSE) |
| downgrade_to_plan              | VARCHAR(50) (nullable) |

Aura Analysis only needs **id, email, username, role** for access control; the rest are for the main app and entitlements.

---

## 7. journal_trades table schema

Defined in **Aura-FX api/journal/trades.js** inside **ensureJournalTable()**:

```sql
CREATE TABLE IF NOT EXISTS journal_trades (
  id CHAR(36) PRIMARY KEY,
  userId INT NOT NULL,
  date DATE NOT NULL,
  pair VARCHAR(64) NOT NULL,
  tradeType VARCHAR(64) DEFAULT NULL,
  session VARCHAR(32) DEFAULT NULL,
  riskPct DECIMAL(10,4) DEFAULT NULL,
  rResult DECIMAL(12,4) NOT NULL,
  dollarResult DECIMAL(16,2) DEFAULT NULL,
  followedRules TINYINT(1) DEFAULT 1,
  notes TEXT DEFAULT NULL,
  emotional TINYINT DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_journal_userId (userId),
  INDEX idx_journal_userId_date (userId, date)
);
```

- **id:** UUID string (CHAR(36)).
- **userId:** INT, links to **users.id** (no FK in this snippet; Aura Analysis migration uses FK to **users(id)** for **aura_analysis_trades**).
- **journal_trades** is the **existing** platform journal; Aura Analysis uses **aura_analysis_trades** (separate table) so the free dashboard does not alter or replace the main journal.

---

## How Aura Analysis should integrate into this architecture

### Principles

1. **Single codebase** – Aura Analysis becomes part of the Aura-FX repo (or the same repo that contains Aura-FX), not a separate app with different patterns.
2. **Same DB and auth** – Use the same **users** table and **api/db.js** + **api/utils/auth.js** (verifyToken). No new auth system; add only minimal helpers for “free dashboard” access (e.g. getCurrentUser + role check).
3. **Same API style** – Use **executeQuery** and `[rows]`; responses use **success**, **errorCode**, **message**; CORS and OPTIONS like existing routes.
4. **Same UI stack** – MUI + Emotion + existing theme/CSS (and AuraDashboard.css). No Tailwind for this module if the main app is MUI.
5. **Separate data** – Keep **aura_analysis_*** tables; do not replace **journal_trades** or **users**.

### Backend integration

- **api/db.js** – Use the **existing** Aura-FX `db.js` (executeQuery, getDbPool). No duplicate pool.
- **api/utils/auth.js** – Use the **existing** `verifyToken`. Add (in this file or in `api/aura-analysis/lib/auth.js`) a small helper that:
  - Calls `verifyToken(req.headers.authorization)`.
  - If no decoded id → return null / 401.
  - `executeQuery('SELECT id, email, username, role FROM users WHERE id = ?', [decoded.id])`.
  - Apply **shubzfx@gmail.com → super_admin** and **allowed** (user, admin, super_admin) vs **blocked** (premium, elite, a7fx); then call the route handler with `(user)`.
- **Routes** – Keep **api/aura-analysis/** (me, assets, trades, analytics, checklists, admin). Each route uses the helper above instead of a different auth layer. Use **executeQuery** everywhere; destructure `[rows]` and use `rows[0]` or `rows` as in journal/trades.js and me.js.

### Frontend integration

- **Theme** – Reuse or extend the **existing** MUI theme (if Aura-FX has one); otherwise keep a single theme that matches Aura-FX colours (#0a0a0a, #8B5CF6, etc.) and typography (e.g. Space Grotesk from AuraDashboard.css).
- **Layout** – Either:
  - **Option A:** Use Aura-FX **AuraDashboardLayout** and add a “Free” or “Manual” tab set (Overview, Calculator, Journal, Analytics, Leaderboard, Checklists, Profile, Admin) so the free dashboard is a tab group alongside existing tabs; or
  - **Option B:** Keep the current **sidebar** layout but wrap it in the same shell (same CSS classes, same Navbar above) so the shell and styling are shared.
- **Navigation** – Use the **existing Navbar** for the top bar; use either the existing **tab bar** (Option A) or the **sidebar** (Option B) for in-dashboard navigation, with the same AuraDashboard.css.
- **Guards** – Use **AuraDashboardGuard** (or extend it) so that only users who are allowed for the free dashboard (user, admin, super_admin; not premium/elite/a7fx) can reach `/aura-analysis/dashboard`; redirect others to Connection Hub or choose-plan as today.
- **Auth context** – Use the **existing AuthContext** and token key (**localStorage 'token'**) so one login works for the whole app; call **GET /api/aura-analysis/me** only to know “allowed for free dashboard” and to show/hide the free dashboard entry point.

### Database

- **users** – Unchanged; Aura Analysis only reads **id, email, username, role** for access control.
- **journal_trades** – Unchanged; existing journal stays as is.
- **aura_analysis_*** – Keep and run migrations on the **same** MySQL DB; **aura_analysis_trades.user_id** references **users.id**.

### Route and path

- Serve the free dashboard under **/aura-analysis/dashboard** (same as Aura-FX’s Aura dashboard route) so that:
  - “Aura Analysis” in the main app means one place (connection hub + dashboard).
  - The “free” experience is either the default view for non-premium users or a clearly named tab/section (e.g. “Manual” or “Free”) inside that dashboard.

### Summary

- **Reuse:** api/db.js (executeQuery), api/utils/auth.js (verifyToken), users table, journal_trades table, MUI theme (or single shared theme), AuraDashboard.css, Navbar, AuraDashboardLayout or its shell, AuthContext and token key.
- **Add:** api/aura-analysis/* routes, aura_analysis_* tables, a small “free dashboard” auth helper (verifyToken + user fetch + role check), and the free dashboard tabs/pages (Overview, Calculator, Journal, etc.) inside the existing dashboard layout.
- **Do not:** Introduce a second auth system, a second DB pool, or a second theme/CSS system; do not replace or duplicate journal_trades or users.

This is the integration approach to follow before generating or refactoring code so that Aura Analysis behaves as a **native feature** of the Aura-FX platform.
