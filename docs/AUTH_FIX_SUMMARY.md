# Auth system fix – Supabase removed, Aura FX JWT only

## Summary

Supabase has been fully removed. The app now uses only the existing Aura FX JWT/session and MySQL-backed API. No Supabase env vars, client, auth pages, or configuration screen.

---

## 1. Deleted files

| File | Reason |
|------|--------|
| `lib/supabase/client.ts` | Supabase client removed |
| `lib/supabase/server.ts` | Supabase server client removed |
| `lib/supabase/middleware.ts` | Supabase middleware removed |
| `components/ConfigRequired.tsx` | Supabase “configuration required” screen removed |
| `supabase/seed/run-seed.ts` | Supabase seed script (referenced removed package) |

---

## 2. Updated files

| File | Changes |
|------|--------|
| **Backend / API** | |
| `lib/db.js` | New: MySQL pool (MYSQL_* or DATABASE_URL). |
| `lib/auth.js` | New: JWT verify + users table; allowed roles (user, admin, super_admin); blocked (premium, elite, a7fx); shubzfx@gmail.com → super_admin. |
| `app/api/aura-analysis/me/route.ts` | New: GET uses lib/auth + lib/db; returns `{ success, user, allowed }` or 401; reads token from `Authorization: Bearer` or cookie `token`. |
| **Auth bootstrap** | |
| `components/AuthProvider.tsx` | New: reads JWT from storage, calls `/api/aura-analysis/me`, sets user/allowed; redirects to main login if no token or not allowed. |
| **Layout & shell** | |
| `app/dashboard/layout.tsx` | Wraps children in `AuthProvider`; uses `DashboardLayoutClient` (no Supabase / ConfigRequired). |
| `app/dashboard/DashboardLayoutClient.tsx` | New: client layout that shows loading then `DashboardShell` with user email from `useAuth()`. |
| `components/dashboard/DashboardShell.tsx` | Sign out clears token from localStorage/sessionStorage and redirects to `NEXT_PUBLIC_MAIN_LOGIN_URL` (no Supabase). |
| **Dashboard pages (Supabase + ConfigRequired removed)** | |
| `app/dashboard/page.tsx` | No createClient/ConfigRequired; uses demo/empty data. |
| `app/dashboard/analytics/page.tsx` | Same. |
| `app/dashboard/admin/page.tsx` | Same. |
| `app/dashboard/calculator/page.tsx` | Same. |
| `app/dashboard/checklists/page.tsx` | Same. |
| `app/dashboard/journal/page.tsx` | Same. |
| `app/dashboard/leaderboard/page.tsx` | Same. |
| `app/dashboard/profile/page.tsx` | Same. |
| **Client components** | |
| `app/dashboard/OverviewClient.tsx` | Uses `formatCurrency`/`formatPercent` from `@/lib/utils` (no functions passed from server). |
| `app/dashboard/calculator/TradeCalculatorPageClient.tsx` | No Supabase insert; save redirects to journal (API persistence can be added later). |
| `hooks/useProfile.ts` | Fetches `/api/aura-analysis/me` with Bearer token instead of Supabase profiles/realtime. |
| `components/trades/TradeDetailSheet.tsx` | No Supabase; trade/checklist load as empty (API can be wired later). |
| **Routes** | |
| `app/auth/callback/route.ts` | No Supabase; redirects to `next` or dashboard on current origin. |
| `app/error.tsx` | Supabase env messaging removed. |
| `app/dashboard/error.tsx` | Supabase env messaging removed. |
| **Config** | |
| `package.json` | Removed `@supabase/ssr`, `@supabase/supabase-js`; added `jsonwebtoken`, `mysql2`; `db:seed` script no longer runs Supabase seed. |

---

## 3. Route behavior

| Route | Behavior |
|-------|----------|
| `/` | Landing; link to main site login and to dashboard. |
| `/login` | Redirects to `NEXT_PUBLIC_MAIN_LOGIN_URL` (main site login). |
| `/signup` | Redirects to `NEXT_PUBLIC_MAIN_LOGIN_URL` (no local signup). |
| `/dashboard/*` | Wrapped in `AuthProvider`; unauthenticated or not allowed → redirect to main login. |
| `/auth/callback` | Redirects to dashboard (or `?next=`) on this app’s origin; no Supabase. |

---

## 4. Where the app reads the existing token

- **Key:** `localStorage` and `sessionStorage` under the key from `NEXT_PUBLIC_AUTH_TOKEN_KEY` (default `"token"`). Same key as the main Aura FX site.
- **Used in:**
  - `components/AuthProvider.tsx` – reads token and sends it as `Authorization: Bearer <token>` to `/api/aura-analysis/me`.
  - `hooks/useProfile.ts` – same token for `/api/aura-analysis/me`.
  - `components/dashboard/DashboardShell.tsx` – clears the same key on sign out.

---

## 5. Where unauthenticated users are redirected

- **Redirect target:** `NEXT_PUBLIC_MAIN_LOGIN_URL` (default `"/"`). Set this to the main Aura FX login URL (e.g. `https://your-aura-fx-site.com/login`).
- **When:** In `AuthProvider`, after loading:
  - No token in localStorage/sessionStorage, or
  - `/api/aura-analysis/me` returns non-OK or `allowed: false`.
- **Mechanism:** `window.location.href = MAIN_LOGIN_URL` (full redirect to main site).

---

## 6. Required environment variables (Vercel)

No Supabase variables. Use only:

- **Auth/API:** `JWT_SECRET` or `JWT_SIGNING_KEY` (same as main Aura FX).
- **Database:** one of:
  - `DATABASE_URL`, or
  - `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` (optional: `MYSQL_PORT`, `MYSQL_SSL`).
- **Optional:**
  - `NEXT_PUBLIC_MAIN_LOGIN_URL` – main site login URL (default `"/"`).
  - `NEXT_PUBLIC_AUTH_TOKEN_KEY` – storage key for JWT (default `"token"`).

---

## 7. Final result

- No Supabase configuration screen or env checks.
- No local signup; `/signup` and `/login` redirect to the main site.
- Auth = existing Aura FX JWT → `/api/aura-analysis/me` → `lib/auth.js` + users table.
- Access allowed for roles: user, admin, super_admin; blocked: premium, elite, a7fx; shubzfx@gmail.com treated as super_admin.
- App can deploy on Vercel with only MySQL + JWT-related env vars.
