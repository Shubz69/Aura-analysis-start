-- Aura Analysis: Initial schema
-- Run this migration in Supabase SQL editor or via CLI

-- Enable UUID extension if not exists
create extension if not exists "uuid-ossp";

-- profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  role text not null default 'member' check (role in ('super_admin', 'admin', 'member')),
  avatar_url text,
  default_account_balance numeric,
  default_risk_percent numeric,
  created_at timestamptz not null default now()
);

-- assets registry
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  symbol text unique not null,
  display_name text not null,
  asset_class text not null,
  quote_type text not null,
  pip_multiplier numeric not null,
  pip_value_hint numeric,
  contract_size_hint numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- trades
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pair text not null,
  asset_id uuid references public.assets(id),
  asset_class text not null,
  direction text not null check (direction in ('buy', 'sell')),
  session text,
  account_balance numeric not null,
  risk_percent numeric not null,
  risk_amount numeric not null,
  entry_price numeric not null,
  stop_loss numeric not null,
  take_profit numeric not null,
  stop_loss_pips numeric not null,
  take_profit_pips numeric not null,
  rr numeric not null,
  position_size numeric not null,
  potential_profit numeric not null,
  potential_loss numeric not null,
  result text not null default 'open' check (result in ('win', 'loss', 'breakeven', 'open')),
  pnl numeric not null default 0,
  r_multiple numeric not null default 0,
  checklist_score numeric not null default 0,
  checklist_total numeric not null default 0,
  checklist_percent numeric not null default 0,
  trade_grade text,
  notes text,
  created_at timestamptz not null default now()
);

-- checklist_templates
create table if not exists public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references public.profiles(id),
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- checklist_template_items
create table if not exists public.checklist_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.checklist_templates(id) on delete cascade,
  label text not null,
  sort_order int not null default 0,
  is_required boolean not null default true
);

-- trade_checklist_items (snapshot per trade)
create table if not exists public.trade_checklist_items (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references public.trades(id) on delete cascade,
  checklist_item_label text not null,
  passed boolean not null default false
);

-- app_settings (key-value for leaderboard visibility etc.)
create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- indexes
create index if not exists idx_trades_user_id on public.trades(user_id);
create index if not exists idx_trades_created_at on public.trades(created_at desc);
create index if not exists idx_trades_pair on public.trades(pair);
create index if not exists idx_trades_result on public.trades(result);
create index if not exists idx_trade_checklist_items_trade_id on public.trade_checklist_items(trade_id);
create index if not exists idx_checklist_template_items_template_id on public.checklist_template_items(template_id);

-- trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'role')::text, 'member')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
