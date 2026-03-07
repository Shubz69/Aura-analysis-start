# Auth and setup (Aura FX only)

This app **does not use Supabase**. It uses the existing **Aura FX** login and database.

## Auth flow

- Users sign in on the **main Aura FX website**. This app reads the same JWT from storage (`NEXT_PUBLIC_AUTH_TOKEN_KEY`, default `"token"`).
- The app calls `GET /api/aura-analysis/me` with `Authorization: Bearer <token>`. The API validates the token and loads the user from the existing **users** table (MySQL).
- Allowed roles: `user`, `admin`, `super_admin`. Blocked: `premium`, `elite`, `a7fx`. The email `shubzfx@gmail.com` is always treated as `super_admin`.

## Environment

See `.env.example`. Required:

- **JWT:** `JWT_SECRET` or `JWT_SIGNING_KEY` (same as main site).
- **Database:** `DATABASE_URL` or `MYSQL_*` (same MySQL as main Aura FX).

Optional:

- `NEXT_PUBLIC_MAIN_LOGIN_URL` — where to redirect unauthenticated users (main site login).
- `NEXT_PUBLIC_AUTH_TOKEN_KEY` — storage key for the token (must match main site).

## User and role management

Users and roles are managed in the **main Aura FX app** and its database. There is no separate signup or RLS in this app. For details on the auth fix and file list, see **`docs/AUTH_FIX_SUMMARY.md`**.
