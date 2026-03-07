# Login redirect + domain fix

## Summary

- **Main site domain:** All references use **https://auraxfx.com** (replaced aura-fx.com).
- **Dashboard route:** Dashboard lives at **/aura-analysis** in this app (moved from /dashboard).
- **Central config:** `lib/appConfig.ts` holds MAIN_SITE_URL, DASHBOARD_ROUTE, and URL builders.
- **Sign in:** "Sign in on main site" goes to `https://auraxfx.com/login?returnUrl=<current_app_origin>/aura-analysis`.
- **Open dashboard:** Stays inside this app at `/aura-analysis` (no redirect to main site).

---

## 1. Central config file

**File:** `lib/appConfig.ts`

- `MAIN_SITE_URL` = `"https://auraxfx.com"`
- `DASHBOARD_ROUTE` = `"/aura-analysis"`
- `MAIN_SITE_LOGIN_URL` = main site login (no query)
- `getMainLoginUrl(returnUrl?)` — builds `https://auraxfx.com/login?returnUrl=...` when returnUrl is provided
- `getAppOrigin()` — server-side app origin from `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_VERCEL_URL`

---

## 2. Files updated

| File | Changes |
|------|--------|
| **lib/appConfig.ts** | **NEW** — Central URL config (auraxfx.com, /aura-analysis, getMainLoginUrl, getAppOrigin). |
| **components/HomeCTA.tsx** | Uses `getMainLoginUrl(returnUrl)` with `window.location.origin + DASHBOARD_ROUTE`; "Open dashboard" links to `DASHBOARD_ROUTE`. |
| **components/AuthProvider.tsx** | Removed aura-fx.com. Redirect uses `getMainLoginUrl(returnUrl)` with same returnUrl. Uses `DASHBOARD_ROUTE`. |
| **components/dashboard/DashboardShell.tsx** | Uses `getMainLoginUrl`, `DASHBOARD_ROUTE`; sign out and nav links point to config. |
| **components/dashboard/DashboardNav.tsx** | All nav hrefs changed from `/dashboard*` to `/aura-analysis*`. |
| **app/login/page.tsx** | Redirects via `getMainLoginUrl(returnUrl)` and `getAppOrigin()` + `DASHBOARD_ROUTE`. |
| **app/signup/page.tsx** | Same as login. |
| **app/auth/callback/route.ts** | Uses `DASHBOARD_ROUTE` and `getAppOrigin()` for redirect target. |
| **app/aura-analysis/** | **Route move:** was `app/dashboard/`. All internal links use `/aura-analysis/*`. |
| **app/aura-analysis/OverviewClient.tsx** | Links to `/aura-analysis/calculator`, `/aura-analysis/journal`. |
| **app/aura-analysis/journal/JournalClient.tsx** | Paths use `/aura-analysis/journal`. |
| **app/aura-analysis/calculator/TradeCalculatorPageClient.tsx** | Redirect after save to `/aura-analysis/journal`. |
| **components/trades/TradeDetailSheet.tsx** | Edit link uses `/aura-analysis/journal/...`. |
| **.env.example** | Optional `NEXT_PUBLIC_APP_URL` for returnUrl; removed old MAIN_LOGIN_URL note. |

---

## 3. Old URL references removed

- **aura-fx.com** — Replaced everywhere with **auraxfx.com** (config + previous HomeCTA/AuthProvider defaults).
- **/dashboard** — Replaced with **/aura-analysis** for all app routes and links.
- **NEXT_PUBLIC_MAIN_LOGIN_URL** — No longer used; main site login URL comes from `lib/appConfig.ts`.

---

## 4. Landing page button logic

- **"Sign in on main site"**  
  - `returnUrl = window.location.origin + DASHBOARD_ROUTE` (e.g. `https://aura-analysis-start.vercel.app/aura-analysis`).  
  - `href = getMainLoginUrl(returnUrl)` → `https://auraxfx.com/login?returnUrl=<encoded_returnUrl>`.

- **"Open dashboard"**  
  - `Link href={DASHBOARD_ROUTE}` → `/aura-analysis` (in-app only).

---

## 5. Redirect logic

- **Unauthenticated in app:**  
  AuthProvider redirects to `getMainLoginUrl(returnUrl)` with `returnUrl = window.location.origin + DASHBOARD_ROUTE`.

- **After login on main site:**  
  Main site redirects to `returnUrl` (this app’s `/aura-analysis`). User lands here with token in storage; app calls `/api/aura-analysis/me`, then shows dashboard if allowed.

- **/login, /signup:**  
  Server redirect to `getMainLoginUrl(returnUrl)` with `returnUrl = getAppOrigin() + DASHBOARD_ROUTE`.

- **/auth/callback:**  
  Redirect to `origin + next` (default `next = DASHBOARD_ROUTE`).

---

## 6. Final result

- No links use aura-fx.com; all main site URLs use **auraxfx.com**.
- Sign in goes to **https://auraxfx.com/login?returnUrl=<this_app>/aura-analysis**.
- "Open dashboard" stays in this app at **/aura-analysis**.
- After login on the main site, user returns to this app and can access the dashboard when the token is valid and role is allowed.
