# Aura Analysis — Authentication and Testing

## Important: No Separate Auth

Aura Analysis **does not** implement its own login, temporary auth, demo auth, or test users.

- **Uses:** Existing **users** table, existing **api/utils/auth.js**, **api/db.js**, and the same **JWT flow** as the main Aura FX platform.
- **Session:** Reuses the **current login session/token** exactly as the existing site. The same token key (e.g. `token` in localStorage/sessionStorage) is used so that when a user logs in on the main site, Aura Analysis can read that token and call `/api/aura-analysis/me`.
- **User data:** The authenticated user is read from the **existing users table** via the existing auth middleware pattern (JWT → user id → `SELECT` from `users`).
- **Access rules** are applied on top of that existing user:
  - **Allow:** `user`, `admin`, `super_admin`
  - **Block:** `premium`, `elite`, `a7fx`
  - **Override:** `shubzfx@gmail.com` is always treated as `super_admin` regardless of DB role.

No separate auth database, separate login API, or demo accounts are created. The only accounts used are **real accounts already in the users table**.

---

## How It Works

1. **User logs in** on the **main Aura FX site** (existing login page and API). The main app stores the JWT in localStorage/sessionStorage (and optionally in a cookie) using its token key.
2. **User opens Aura Analysis** (e.g. `/aura-analysis` or `/aura-analysis/dashboard`). The Aura Analysis frontend reads the token from the **same storage key** as the main app (configurable via `REACT_APP_AUTH_TOKEN_KEY`, default `token`).
3. **Every API request** from Aura Analysis sends `Authorization: Bearer <token>`. The backend uses **api/utils/auth.js**:
   - **verifyToken** validates the JWT (same secret as main app: `JWT_SECRET` or `JWT_SIGNING_KEY`).
   - **getCurrentUserFromToken** loads the user from the **users** table by `id` (from the JWT) and applies the super_admin override for `shubzfx@gmail.com`.
   - **requireFreeDashboardAccess** / **requireAdminAccess** enforce the allow/block list and admin-only routes.
4. **No Aura Analysis login page** collects credentials. The `/login` route in this app is a **gate**: it tells the user to log in on the main site and offers “I’m logged in, continue” to retry session detection.

---

## Environment (Token Key and Main Login URL)

- **`REACT_APP_AUTH_TOKEN_KEY`** — Storage key for the JWT (localStorage/sessionStorage). Must match the main Aura FX app. Default: `token`.
- **`REACT_APP_MAIN_LOGIN_URL`** — URL of the main site’s login page (for “Open main site to log in” and for redirect after logout). Default: `/`.

Backend uses the same **JWT_SECRET** (or **JWT_SIGNING_KEY**) as the main platform so tokens issued by the main app are valid for Aura Analysis APIs.

---

## How to Test Aura Analysis Using Existing Login and DB Users

**Prerequisite:** MySQL has the **users** table and at least one real user with a role that is allowed (`user`, `admin`, or `super_admin`). No demo or test-only auth accounts are required beyond what you already have.

### Option A: Aura Analysis Served by the Main Aura FX App (integrated)

1. **Run the main Aura FX app** (with its existing login and JWT issuance).
2. **Log in** on the main site with a **real user** from the **users** table (e.g. a user with `role = 'user'` or `admin` or `super_admin`).
3. **Navigate to Aura Analysis** (e.g. `/aura-analysis` or the route where the main app mounts the dashboard). The main app should already have set the JWT in localStorage/sessionStorage (and optionally cookie) using its token key.
4. **Ensure** the Aura Analysis frontend is configured to use the **same token key** as the main app (`REACT_APP_AUTH_TOKEN_KEY` if the main app uses something other than `token`).
5. Aura Analysis will read the existing token, call `GET /api/aura-analysis/me`, and load the user from the **users** table. If the user’s role is allowed, the dashboard loads. If the role is blocked (premium/elite/a7fx), the user sees an access-denied message.
6. **To test the super_admin override:** Use an account with email `shubzfx@gmail.com` (any role in DB). It should always be treated as `super_admin` and have access (including Admin).
7. **To test blocked roles:** Log in as a user with `role` `premium`, `elite`, or `a7fx`. They should get “manual users only” (or similar) and no dashboard access.

No separate login, no demo auth, no new test users — only existing DB users and the existing login flow.

### Option B: Aura Analysis Run Standalone (e.g. CRA on port 3000, API on 3001)

When the main app is not running, you still use the **same users table and same JWT**; only the way the user obtains the token differs.

1. **Database:** Run migrations and seeds. Ensure the **users** table exists and contains at least one real user with an allowed role (`user`, `admin`, or `super_admin`). Do **not** create special “test” or “demo” auth accounts; use existing accounts.
2. **Obtain a valid JWT** for that user using the **main Aura FX platform’s** login (e.g. run the main app, log in there, then copy the token from the main app’s storage), **or** use the main app’s existing auth API to sign in and get a token. Do **not** use a separate Aura Analysis login API (there is none).
3. **Set the token** in the browser Aura Analysis will use:
   - Open the Aura Analysis app (e.g. http://localhost:3000).
   - In DevTools → Application → Local Storage (or Session Storage) for that origin, set the key that Aura Analysis uses (default `token`) to the JWT string you obtained from the main app.
4. **Reload** or click “I’m logged in, continue” on the Aura Analysis login gate. The app will call `GET /api/aura-analysis/me` with that token. The backend will validate the JWT and load the user from the **users** table, then apply access rules.
5. **Verify:** Dashboard loads for allowed roles; blocked roles get access denied; `shubzfx@gmail.com` always has super_admin access.

Again: no separate auth system, no demo accounts — only the existing users table and the existing JWT flow (token obtained via the main site or its auth API).

---

## Summary

| Requirement | Implementation |
|-------------|----------------|
| Reuse current login session/token | Same token key as main app (`REACT_APP_AUTH_TOKEN_KEY`, default `token`). |
| Read authenticated user from existing JWT/auth | `api/utils/auth.js`: `verifyToken` + `getCurrentUserFromToken`; user from **users** table. |
| Apply Aura Analysis access rules | `requireFreeDashboardAccess` / `requireAdminAccess`; allow user/admin/super_admin; block premium/elite/a7fx; shubzfx@gmail.com → super_admin. |
| No separate auth DB or login API | No Aura Analysis login API; no demo/temporary auth. |
| No demo accounts for auth testing | Use only real accounts already in **users** table. |
| How to test | Log in on main Aura FX site with a real user → open Aura Analysis; or (standalone) set token from main app in storage and use “I’m logged in, continue”. |
