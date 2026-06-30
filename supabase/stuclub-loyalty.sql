-- =============================================================================
-- STUClub Loyalty System — Database Migration
-- Run in Supabase SQL Editor (one-time).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Add loyalty columns to existing users table
-- -----------------------------------------------------------------------------
alter table public.users
  add column if not exists stu_points integer not null default 0;

alter table public.users
  add column if not exists membership_tier text not null default 'Starter';

-- -----------------------------------------------------------------------------
-- 2) Create member_points_history table
-- -----------------------------------------------------------------------------
create table if not exists public.member_points_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  order_id uuid references public.orders(id),
  points integer not null check (points > 0),
  type text not null check (type in ('earned','bonus','manual_add','manual_deduct')),
  description text,
  created_at timestamptz not null default now()
);

create index if not exists member_points_history_user_idx
  on public.member_points_history(user_id);

create index if not exists member_points_history_order_idx
  on public.member_points_history(order_id);

create index if not exists member_points_history_created_idx
  on public.member_points_history(created_at desc);

-- -----------------------------------------------------------------------------
-- 3) Create user_coupons table
-- -----------------------------------------------------------------------------
create table if not exists public.user_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  status text not null default 'available'
    check (status in ('available','used','expired')),
  issued_at timestamptz not null default now(),
  used_at timestamptz,
  unique (user_id, coupon_id)
);

create index if not exists user_coupons_user_idx
  on public.user_coupons(user_id);

create index if not exists user_coupons_status_idx
  on public.user_coupons(status);

create index if not exists user_coupons_coupon_idx
  on public.user_coupons(coupon_id);

-- -----------------------------------------------------------------------------
-- 4) RLS policies for new tables
-- -----------------------------------------------------------------------------
alter table public.member_points_history enable row level security;
alter table public.user_coupons enable row level security;

drop policy if exists "Users view own points history" on public.member_points_history;
create policy "Users view own points history"
  on public.member_points_history for select
  using (auth.uid() = user_id);

drop policy if exists "Users cannot modify points history" on public.member_points_history;
create policy "Users cannot modify points history"
  on public.member_points_history for all
  using (false)
  with check (false);

drop policy if exists "Users view own coupons" on public.user_coupons;
create policy "Users view own coupons"
  on public.user_coupons for select
  using (auth.uid() = user_id);

drop policy if exists "Users cannot modify coupons" on public.user_coupons;
create policy "Users cannot modify coupons"
  on public.user_coupons for all
  using (false)
  with check (false);

-- -----------------------------------------------------------------------------
-- 5) Seed membership reward coupons (if not exists)
-- -----------------------------------------------------------------------------
-- WELCOME100: 100,000 VND fixed discount for new accounts
insert into public.coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, used_count, is_active, expires_at)
values (
  'WELCOME100',
  'Welcome voucher — 100,000 VND off for new members',
  'fixed',
  100000,
  0,
  null,
  0,
  true,
  null
)
on conflict (code) do nothing;

-- MEMBER10: Member tier reward — 10% off (max 300,000 VND)
insert into public.coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, used_count, is_active, expires_at)
values (
  'MEMBER10',
  'Member tier reward — 10% off (max 300,000 VND)',
  'percent',
  10,
  0,
  null,
  0,
  true,
  null
)
on conflict (code) do nothing;

-- ELITE15: Elite tier reward — 15% off (max 1,000,000 VND)
insert into public.coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, used_count, is_active, expires_at)
values (
  'ELITE15',
  'Elite tier reward — 15% off (max 1,000,000 VND)',
  'percent',
  15,
  0,
  null,
  0,
  true,
  null
)
on conflict (code) do nothing;

-- -----------------------------------------------------------------------------
-- 6) Helper functions
-- -----------------------------------------------------------------------------

-- Calculate tier from points
create or replace function public.get_tier_from_points(p_points integer)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_points >= 2000 then 'Elite'
    when p_points >= 500 then 'Member'
    else 'Starter'
  end;
$$;

grant execute on function public.get_tier_from_points(integer) to authenticated;
grant execute on function public.get_tier_from_points(integer) to service_role;

-- Calculate points from subtotal (1 point per 60,000 VND)
create or replace function public.calculate_points_from_subtotal(p_subtotal numeric)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select floor(p_subtotal / 60000)::integer;
$$;

grant execute on function public.calculate_points_from_subtotal(numeric) to authenticated;
grant execute on function public.calculate_points_from_subtotal(numeric) to service_role;

-- -----------------------------------------------------------------------------
-- 7) Backfill: ensure existing users have default values
-- -----------------------------------------------------------------------------
update public.users
set
  stu_points = 0,
  membership_tier = 'Starter'
where stu_points is null
   or membership_tier is null;

-- -----------------------------------------------------------------------------
-- 8) Reload schema cache
-- -----------------------------------------------------------------------------
notify pgrst, 'reload schema';
