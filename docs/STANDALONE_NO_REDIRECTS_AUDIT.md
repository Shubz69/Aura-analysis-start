# Standalone app — external redirects removed (audit)

## 1. Files where external redirects were removed

| File | Change |
|------|--------|
| **lib/appConfig.ts** | Removed `MAIN_SITE_URL`, `MAIN_SITE_LOGIN_PATH`, `MAIN_SITE_LOGIN_URL`, `getMainLoginUrl()`, `getAppOrigin()`. Kept only `DASHBOARD_ROUTE` and `BYPASS_AUTH`. `BYPASS_AUTH` now defaults to true (standalone by default). |
| **components/AuthProvider.tsx** | Removed redirect to external login. When no token or API failure, sets mock user and `allowed=true` instead of redirecting. No `window.location.href` to any external domain. |
| **components/dashboard/DashboardShell.tsx** | Sign out: no longer calls `getMainLoginUrl()`. Clears token and uses `router.push(DASHBOARD_ROUTE)` (internal only). |
| **app/page.tsx** | Removed landing content and `HomeCTA`. Root now only redirects to `DASHBOARD_ROUTE`. No "Sign in on main site" or "Open dashboard" buttons. |
| **app/login/page.tsx** | No longer redirects to main site. Redirects to `DASHBOARD_ROUTE` only. |
| **app/signup/page.tsx** | Same as login. |
| **app/auth/callback/route.ts** | Removed `getAppOrigin()`. Redirect uses only `request.url` origin + `next` (internal app redirect). |

---

## 2. Files where auraxfx.com / aura-fx.com references were removed

| File | Change |
|------|--------|
| **lib/appConfig.ts** | Removed `MAIN_SITE_URL = "https://auraxfx.com"`, `MAIN_SITE_LOGIN_PATH`, `MAIN_SITE_LOGIN_URL`, and all functions that built auraxfx.com URLs. |
| **components/HomeCTA.tsx** | **Deleted.** Contained "Sign in on main site" link to `getMainLoginUrl(returnUrl)` (auraxfx.com). No longer used; root redirects before any CTA. |

No remaining references to auraxfx.com or aura-fx.com in app source (ts/tsx/js/jsx). Docs in `docs/` may still mention them historically.

---

## 3. Route that opens first

- **`/`** (root) → server redirects to **`/aura-analysis`** (Overview).
- **First screen:** Aura Analysis Overview (dashboard). No landing page, no auth gate, no external redirect.

---

## 4. Landing / auth pages

| Route | Behavior |
|-------|----------|
| **`/`** | Redirect only → `/aura-analysis`. No landing content. |
| **`/login`** | Redirect only → `/aura-analysis`. No login form, no main-site link. |
| **`/signup`** | Redirect only → `/aura-analysis`. No signup form, no main-site link. |
| **Landing copy** | Removed. No "Use your existing Aura FX account", "Log in on the main site", "Sign in on main site", or "Return here after login". |
| **Auth gate** | Bypassed. AuthProvider always provides a user (mock or from `/me`); no redirect when unauthenticated. |

---

## 5. Confirmation: zero external redirects

| Check | Result |
|-------|--------|
| Any `window.location.href` to auraxfx.com | **None.** |
| Any `window.location.href` to aura-fx.com | **None.** |
| Any redirect() to external login URL | **None.** (login/signup redirect to `DASHBOARD_ROUTE` only.) |
| `getMainLoginUrl` / `returnUrl` / `MAIN_SITE_*` in app code | **None.** (Removed from appConfig and all consumers.) |
| HomeCTA or "Sign in on main site" button | **None.** (HomeCTA deleted; root does not render it.) |

The app stays entirely inside its own origin. Sign out sends the user to `/aura-analysis` (same app).

---

## 6. Auth behavior (standalone)

- **BYPASS_AUTH** defaults to **true** (no env needed for standalone).
- When **true:** mock user (Shubz, shubzfx@gmail.com, super_admin) is set; dashboard loads with demo data.
- When **false:** AuthProvider still never redirects externally. If no token, mock user is used. If token exists, `/api/aura-analysis/me` is called; on failure, mock user is used.
- No CTA or copy directs the user to any external website.

---

## 7. Dashboard and data

- Overview, Calculator, Journal, Analytics, Leaderboard, Checklists, Profile, Admin all remain.
- Demo data used when `BYPASS_AUTH` is true (and when no DB); charts and tables still render.
- DB/API optional; dashboard always renderable.
