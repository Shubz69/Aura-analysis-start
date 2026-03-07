# Aura Analysis – Repository Alignment with Aura-FX

This document summarizes the **source-of-truth** patterns from [Shubz69/Aura-FX](https://github.com/Shubz69/Aura-FX) and how the Aura Analysis free manual dashboard aligns so it can integrate as a native feature at `/aura-analysis/dashboard`.

---

## 1. Backend – API & Database

### 1.1 Database (api/db.js)

**Aura-FX pattern:**

- **mysql2** connection pool only (no Prisma/Sequelize/ORM).
- **Env:** `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` (optional: `MYSQL_PORT`, `MYSQL_SSL`).
- **Exports:** `getDbPool()`, `executeQuery(query, params [, options])`.
- **executeQuery** returns `[rows, fields]` (mysql2 `connection.execute` result). Routes use `const [rows] = await executeQuery(...)`.
- Pool config: serverless-friendly (e.g. lower `connectionLimit` on Vercel), `connectTimeout`, `enableKeepAlive`, optional SSL.
- Helpers: `executeTransaction`, `columnExists`, `addColumnIfNotExists`, etc.

**Aura Analysis manual app:**

- Uses **api/db.js** with mysql2 pool.
- Exposes **executeQuery** (returns `[rows, fields]`) and **getDbPool** to match the repo; keeps a **query** helper that returns `rows` only for backward compatibility.
- Env: same `MYSQL_*`; optional `DATABASE_URL` fallback for local/dev.

### 1.2 Authentication (api/utils/auth.js)

**Aura-FX pattern:**

- **verifyToken(authHeader)** – reads `Authorization: Bearer <token>`, verifies JWT with `JWT_SECRET`, returns decoded payload or `null`. Decoded has **id** (user id).
- No built-in “get user from DB” in auth.js; each route (e.g. **api/me.js**) calls `verifyToken`, then fetches user/entitlements via DB.
- **api/me.js** uses `getEntitlements(userRow)` from **api/utils/entitlements.js**; **SUPER_ADMIN_EMAIL** = `shubzfx@gmail.com` in entitlements.

**Aura Analysis manual app:**

- **Dashboard auth** lives in **api/utils/auth.js** (dashboard-specific helpers):
  - **getCurrentUserFromToken(req, db)** – uses same JWT pattern as repo (Bearer token or cookie), then loads user from **users** with `db.executeQuery` / `db.query`; applies **shubzfx@gmail.com → super_admin**.
  - **requireFreeDashboardAccess(req, res, db, callback)** – allowed: `user`, `admin`, `super_admin`; blocked: `premium`, `elite`, `a7fx`.
- When merged into Aura-FX, dashboard routes can use repo’s **verifyToken** and a single user fetch + role check, or keep this helper that calls repo’s `verifyToken` and then DB.

### 1.3 API route structure

**Aura-FX pattern:**

- **Path:** `/api/<feature>/<route>.js` (e.g. `/api/journal/trades.js`, `/api/me.js`).
- **Handler:** `module.exports = async (req, res) => { ... }`.
- **Auth:** `const decoded = verifyToken(req.headers.authorization); if (!decoded || !decoded.id) return res.status(401).json({ success: false, message: '...' });`
- **DB:** `const { executeQuery } = require('../db'); const [rows] = await executeQuery('SELECT ...', [params]);`
- **Responses:** `{ success: true/false, message?, errorCode?, ...data }`. 401/403/404/500 with consistent shape.
- **CORS:** Often set `Access-Control-Allow-Origin`, `Allow-Methods`, `Allow-Headers`; handle OPTIONS.

**Aura Analysis manual app:**

- Routes under **api/aura-analysis/** (e.g. **api/aura-analysis/me.js**, **api/aura-analysis/trades/index.js**, **api/aura-analysis/trades/[id].js**).
- Uses **api/db.js** and **api/utils/auth.js**; auth via **requireFreeDashboardAccess** / **requireAdminAccess** (which use verifyToken + user fetch + role check).
- Response shape aligned where applicable: `success`, `message`, `errorCode` for errors; same status codes.

### 1.4 Journal / trades in Aura-FX

- **api/journal/trades.js** – single file for list/get/post/put/delete; table **journal_trades** (id, userId, date, pair, tradeType, session, riskPct, rResult, dollarResult, followedRules, notes, emotional).
- Aura Analysis uses a **separate** table **aura_analysis_trades** (and **aura_analysis_***) so the free manual dashboard does not alter existing journal_trades or app behavior.

---

## 2. Frontend – UI & structure

### 2.1 App structure (Aura-FX)

- **src/App.js** – `AuthProvider`, `SubscriptionProvider`, `EntitlementsProvider`, route guards, lazy-loaded pages.
- **Aura dashboard** path: **/aura-analysis/dashboard**; layout: **AuraDashboardLayout**; guard: **AuraDashboardGuard** (uses **useAuth** and **useCanEnterAuraDashboard**).
- **Tabs:** Overview, Performance, Risk Lab, Edge Analyzer, Execution Lab, Calendar, Psychology, Growth (in **AuraDashboardLayout**).
- **Auth:** **AuthContext** – token in **localStorage** as `token`; **resolveUserInfo** maps `shubzfx@gmail.com` → **SUPER_ADMIN** (role).

### 2.2 Styling (Aura-FX)

- **MUI + Emotion** (no Tailwind).
- **Theme:** dark (#0a0a0a, #0f0f23-style), primary purple (#8B5CF6, rgba(139, 92, 246, …)).
- **Dashboard CSS:** **src/styles/aura-analysis/AuraDashboard.css** – Space Grotesk, sticky tab bar, `.aura-dashboard`, `.aura-dashboard-tab`, `.aura-dashboard-content`, scrollbar styling.

**Aura Analysis manual app:**

- Uses **MUI + Emotion + custom CSS**; **AuraDashboard.css** (or equivalent) applied so the free dashboard matches the same look and class names where relevant.
- Token: can use **localStorage `token`** when integrated so the same session works across the app.

### 2.3 Reusable components (Aura-FX)

- **Navbar**, **Footer**, **LoadingSpinner**, **RouteGuards** (AuthenticatedGuard, AdminGuard, etc.).
- When merging, Aura Analysis pages should use the same **Navbar**/layout and guards where possible; the free dashboard can sit under a route like `/aura-analysis/dashboard` with its own tab set (Overview, Calculator, Journal, Analytics, Leaderboard, Checklists, Profile, Admin).

---

## 3. Database

- **Aura-FX:** MySQL (e.g. Railway); **users** table (and related) used by **api/me.js** and entitlements.
- **journal_trades** – existing journal table (see api/journal/trades.js).
- **Aura Analysis:** New tables with prefix **aura_analysis_** (aura_analysis_assets, aura_analysis_trades, aura_analysis_checklist_templates, etc.); **aura_analysis_trades.user_id** references **users.id** so the same auth and user base are used.

---

## 4. Environment variables

**Aura-FX .env.example** (and typical usage):

- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` (and optionally `MYSQL_PORT`, `MYSQL_SSL`).
- `JWT_SECRET` (or `JWT_SIGNING_KEY`) for auth.

**Aura Analysis manual app:**

- Same **MYSQL_*** and **JWT_SECRET**; optional **DATABASE_URL** for local convenience. No extra backends (no Supabase, etc.).

---

## 5. Code style

- **JavaScript only** (no TypeScript in Aura-FX or in this dashboard).
- **async/await**; raw SQL with parameterized queries; no string concatenation for SQL.
- **Error handling:** try/catch in handlers; 4xx/5xx with `success: false` and `message` / `errorCode` where used in the repo.

---

## 6. Integration checklist (when merging into Aura-FX)

1. **API:** Copy **api/aura-analysis/** into the repo; ensure **api/db.js** and **api/utils/auth.js** are the single source (dashboard auth helper can require repo’s `verifyToken` and use repo’s `executeQuery`).
2. **DB:** Run **aura_analysis_*** migrations on the same MySQL; keep **users** and **journal_trades** unchanged.
3. **Frontend:** Mount Aura Analysis routes under **/aura-analysis/dashboard**; reuse **AuthContext** (token key `token`), **Navbar**, and **AuraDashboardLayout**-style shell; use **AuraDashboard.css** and same tab/content structure where possible.
4. **Guards:** Use or extend **AuraDashboardGuard** so only allowed roles (user, admin, super_admin) can access the free dashboard; block premium/elite/a7fx as specified.
5. **Env:** Use existing **MYSQL_*** and **JWT_SECRET**; no new backend services.

---

## 7. Files in Aura-FX to reuse or mirror

| Area        | In Aura-FX repo                         | In Aura Analysis manual app                    |
|------------|------------------------------------------|-----------------------------------------------|
| DB         | api/db.js (executeQuery, getDbPool)      | api/db.js aligned to same interface           |
| Auth       | api/utils/auth.js (verifyToken)         | api/utils/auth.js (verifyToken + dashboard)   |
| User/me    | api/me.js (user + entitlements)         | api/aura-analysis/me.js (user + allowed)       |
| Journal    | api/journal/trades.js                    | api/aura-analysis/trades/* (aura_analysis_*)   |
| Layout     | src/pages/aura-analysis/AuraDashboardLayout.js | DashboardLayout + AuraDashboard.css   |
| Styles     | src/styles/aura-analysis/AuraDashboard.css    | Same CSS copied / linked                      |
| Auth context | src/context/AuthContext.js              | Use same token key when merged                |

This alignment keeps the Aura Analysis free manual dashboard consistent with Aura-FX so it can be merged into **/aura-analysis/dashboard** and feel like a native part of the platform.
