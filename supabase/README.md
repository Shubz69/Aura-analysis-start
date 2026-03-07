# Legacy Supabase schema (not used at runtime)

The **Aura Analysis** app no longer uses Supabase. Auth and data use the **existing Aura FX** JWT and MySQL.

The SQL in `migrations/` and `seed/` is kept only as legacy reference. Do not configure Supabase or these env vars for this app: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

See `docs/AUTH_FIX_SUMMARY.md` and `README.md` for current setup.
