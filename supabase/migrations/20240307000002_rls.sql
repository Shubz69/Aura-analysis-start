-- RLS policies for Aura Analysis

alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.trades enable row level security;
alter table public.checklist_templates enable row level security;
alter table public.checklist_template_items enable row level security;
alter table public.trade_checklist_items enable row level security;
alter table public.app_settings enable row level security;

-- helper: is admin or super_admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$ language sql security definer stable;

create or replace function public.is_super_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$ language sql security definer stable;

-- profiles: own row for members; admins read all; super_admin full
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can update any profile role" on public.profiles
  for update using (public.is_admin());

create policy "Super admin insert profile" on public.profiles
  for insert with check (public.is_super_admin());

-- assets: all authenticated read; only admin/super_admin write
create policy "Authenticated can read assets" on public.assets
  for select using (auth.role() = 'authenticated');

create policy "Admin can manage assets" on public.assets
  for all using (public.is_admin());

-- trades: members own; admins read/write all
create policy "Users can read own trades" on public.trades
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own trades" on public.trades
  for insert with check (auth.uid() = user_id);

create policy "Users can update own trades" on public.trades
  for update using (auth.uid() = user_id);

create policy "Users can delete own trades" on public.trades
  for delete using (auth.uid() = user_id);

create policy "Admins can do all trades" on public.trades
  for all using (public.is_admin());

-- checklist_templates: all authenticated read active; admin create/update
create policy "Authenticated read active templates" on public.checklist_templates
  for select using (auth.role() = 'authenticated' and (is_active = true or created_by = auth.uid() or public.is_admin()));

create policy "Admin manage templates" on public.checklist_templates
  for all using (public.is_admin());

-- checklist_template_items: read with template; admin manage
create policy "Read template items" on public.checklist_template_items
  for select using (
    exists (
      select 1 from public.checklist_templates ct
      where ct.id = template_id and (ct.is_active = true or ct.created_by = auth.uid() or public.is_admin())
    )
  );

create policy "Admin manage template items" on public.checklist_template_items
  for all using (public.is_admin());

-- trade_checklist_items: via trade ownership
create policy "Users read own trade checklist items" on public.trade_checklist_items
  for select using (
    exists (select 1 from public.trades t where t.id = trade_id and (t.user_id = auth.uid() or public.is_admin()))
  );

create policy "Users insert own trade checklist items" on public.trade_checklist_items
  for insert with check (
    exists (select 1 from public.trades t where t.id = trade_id and t.user_id = auth.uid())
  );

create policy "Users update own trade checklist items" on public.trade_checklist_items
  for update using (
    exists (select 1 from public.trades t where t.id = trade_id and t.user_id = auth.uid())
  );

create policy "Users delete own trade checklist items" on public.trade_checklist_items
  for delete using (
    exists (select 1 from public.trades t where t.id = trade_id and t.user_id = auth.uid())
  );

-- app_settings: all read; admin write
create policy "Authenticated read app_settings" on public.app_settings
  for select using (auth.role() = 'authenticated');

create policy "Admin manage app_settings" on public.app_settings
  for all using (public.is_admin());
