# Aura Analysis Free Manual Dashboard — Architecture Summary

## STEP 1 — Repository Analysis (Summary)

### Existing dashboard UI components
- **Aura-FX (source):** Tab-based `AuraDashboardLayout.js` with `AuraDashboard.css`; global Navbar; RouteGuards (CommunityGuard, SubscriptionPageGuard, PremiumAIGuard, AdminGuard, AuthenticatedGuard); `AuraDashboardGuard` for free dashboard access.
- **This app:** MUI `DashboardLayout.js` (Drawer + AppBar + sidebar list); `ProtectedRoute.js`; pages: Overview, Calculator, Journal, Analytics, Leaderboard, Checklists, Profile, Admin.

### Material UI theme
- **aura-analysis-manual/src/theme.js:** Dark theme; primary `#8B5CF6`, background `#0f0f23` / `#1a1a2e`; MuiDrawer, MuiAppBar, MuiCard overrides; Inter font. No Tailwind.

### Layout wrappers
- **DashboardLayout.js:** MUI Drawer (260px), AppBar, main content `<Outlet />`; responsive (temporary drawer on mobile). Uses `aura-dashboard` class and `AuraDashboard.css`.

### Navigation / sidebar
- Sidebar: ListItemButton + NavLink for Overview, Trade Calculator, Journal, Analytics, Leaderboard, Checklists, Profile; Admin link when `isAdmin`; Logout at bottom. Token key: `aura_token` (localStorage/sessionStorage).

### Card / table / chart components
- **Cards:** MUI Card with border `rgba(139, 92, 246, 0.2)`.
- **Tables:** MUI Table, TableHead, TableBody, TableCell, TableRow.
- **Charts:** Recharts (LineChart, BarChart, etc.) with dark styling (#333 grid, #8B5CF6 stroke).

### API route examples
- **api/me.js:** GET; `getCurrentUserFromToken(req, db)`; returns `{ success, user, allowed, message }`.
- **api/aura-analysis/trades/index.js:** GET (filters: pair, result, session, direction, from, to, limit, offset); POST (body → INSERT); uses `requireFreeDashboardAccess`, `db.query`.
- **api/aura-analysis/analytics/overview.js:** GET; trades by user_id; computes winRate, totalPnL, profitFactor, equityCurve, consistencyScore.

### Auth middleware patterns
- **api/utils/auth.js:** `verifyToken(authHeader)`; `getCurrentUserFromToken(req, db)`; `requireAuth(req, res, db)`; `requireFreeDashboardAccess(req, res, db, callback)`; `requireAdminAccess(req, res, db, callback)`; `isSuperAdminOverride(user)`; `getEffectiveRole(user)`.
- **Role rules:** Allowed: user, admin, super_admin. Blocked: premium, elite, a7fx. Override: `shubzfx@gmail.com` → super_admin.

### MySQL query patterns (api/db.js)
- **executeQuery(sql, params)** → `[rows, fields]` (mysql2 execute).
- **query(sql, params)** → `rows` only (convenience). All routes use `db.query` or could use `executeQuery`; parameterized queries only.

### Role checking logic
- In auth: `BLOCKED_ROLES.includes(user.role)` → 403; `ALLOWED_ROLES.includes(effectiveRole)` for free dashboard; admin routes use `requireAdminAccess` (admin or super_admin).

### Environment variables
- **API/DB:** `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`; optional: `MYSQL_PORT`, `MYSQL_SSL`, `DATABASE_URL`.
- **Auth:** `JWT_SECRET` or `JWT_SIGNING_KEY`.
- **Frontend:** `REACT_APP_API_URL` (empty for same-origin proxy).

---

## Integration with Aura-FX

- Use same **users** table; no new auth system. All new data in **aura_analysis_*** tables; **aura_analysis_trades.user_id** → **users.id**.
- API responses: `success`, `message`, `errorCode` where applicable; CORS and OPTIONS handled by Vercel.
- Frontend: MUI + Emotion + existing theme/CSS; no Tailwind. When merged into Aura-FX, mount under `/aura-analysis/dashboard` and reuse Navbar + guard.
