-- =============================================================================
-- STUClub Loyalty System — Combined Migration (users PK + loyalty tables)
-- Chạy TOÀN BỘ file này trong Supabase SQL Editor (một lần).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) Fix users table PK if needed
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'admin');
  end if;
end $$;

create table if not exists public.users (
  id uuid,
  email text,
  role public.user_role default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

delete from public.users where id is null;

delete from public.users u
where u.ctid not in (
  select min(u2.ctid)
  from public.users u2
  where u2.id is not null
  group by u2.id
);

alter table public.users alter column id set not null;

insert into public.users (id, email, role)
select
  au.id,
  lower(trim(au.email)),
  case
    when lower(trim(au.email)) = 'workspaceplace22@gmail.com' then 'admin'::public.user_role
    else 'user'::public.user_role
  end
from auth.users au
where au.email is not null
  and trim(au.email) <> ''
  and not exists (select 1 from public.users u where u.id = au.id);

do $$
declare
  v_has_pk_on_id boolean;
begin
  select exists (
    select 1
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    join pg_attribute a on a.attrelid = t.oid and a.attnum = any (c.conkey)
    where n.nspname = 'public'
      and t.relname = 'users'
      and c.contype = 'p'
      and a.attname = 'id'
  ) into v_has_pk_on_id;

  if not v_has_pk_on_id then
    if exists (
      select 1
      from pg_constraint c
      join pg_class t on c.conrelid = t.oid
      join pg_namespace n on t.relnamespace = n.oid
      where n.nspname = 'public'
        and t.relname = 'users'
        and c.contype = 'p'
    ) then
      execute (
        select format(
          'alter table public.users drop constraint %I',
          c.conname
        )
        from pg_constraint c
        join pg_class t on c.conrelid = t.oid
        join pg_namespace n on t.relnamespace = n.oid
        where n.nspname = 'public'
          and t.relname = 'users'
          and c.contype = 'p'
        limit 1
      );
    end if;

    alter table public.users add primary key (id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    where t.relname = 'users'
      and c.conname = 'users_id_fkey'
  ) then
    alter table public.users
      add constraint users_id_fkey
      foreign key (id) references auth.users (id) on delete cascade;
  end if;
exception
  when duplicate_object then null;
  when others then
    raise notice 'users_id_fkey: % (có thể đã tồn tại với tên khác)', sqlerrm;
end $$;

create unique index if not exists users_email_key on public.users (email);

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

insert into public.coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, used_count, is_active, expires_at)
values (
  'ELITE15',
  'Elite tier reward — 15% off (max 500,000 VND)',
  'percent',
  15,
  0,
  null,
  0,
  true,
  null
)
on conflict (code) do nothing;

notify pgrst, 'reload schema';
