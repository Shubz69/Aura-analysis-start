# RLS and manual setup

## Row Level Security (RLS) — what’s in the migration

The migration `20240307000002_rls.sql` enables RLS on all public tables and creates:

- **Helpers:** `public.is_admin()` and `public.is_super_admin()` (security definer, read `profiles` for `auth.uid()`).
- **profiles:** Users read own or (if admin) any; users update own; only super_admin can insert (trigger normally creates profiles).
- **assets:** Authenticated read; only admin/super_admin can insert/update/delete.
- **trades:** Users read/insert/update/delete own; admins have full access via a separate “all” policy.
- **checklist_templates:** Authenticated read active or own or (if admin) all; only admin/super_admin can modify.
- **checklist_template_items:** Read if template is visible; only admin/super_admin can modify.
- **trade_checklist_items:** Read/insert/update/delete only for the user who owns the trade (or admin).
- **app_settings:** Authenticated read; only admin/super_admin can modify.

## Manual policy steps (if you change schema or Supabase resets RLS)

1. **Enable RLS** on each table:  
   `ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;`

2. **Recreate helpers** (run the `create or replace function` blocks for `is_admin` and `is_super_admin` from the migration).

3. **Recreate policies** in this order (to avoid dependency issues):
   - profiles (select, update for own; update for admin; insert for super_admin)
   - assets (select for authenticated; all for admin)
   - trades (select/insert/update/delete own; all for admin)
   - checklist_templates (select; all for admin)
   - checklist_template_items (select; all for admin)
   - trade_checklist_items (select/insert/update/delete via trade ownership)
   - app_settings (select; all for admin)

4. **New tables:** If you add a new table that should respect roles, add an RLS policy that uses `auth.uid()` and/or `public.is_admin()` / `public.is_super_admin()` as in the migration.

## First admin user

- Sign up a user through the app (Auth → Email).
- In Supabase: **Table Editor → profiles** → find the row where `id` = that user’s UUID → set `role` to `admin` or `super_admin`.

No extra SQL is required for the first admin if the trigger and RLS are already applied.
