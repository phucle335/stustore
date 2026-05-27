-- =============================================================================
-- Thành viên: cột hồ sơ users, favorites, coupons, cột giảm giá orders
-- Chạy TOÀN BỘ file này trong Supabase → SQL Editor (một lần).
-- Nếu vẫn lỗi: chạy trước repair-users-primary-key.sql rồi chạy lại file này.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1) Hàm dùng chung (tránh lỗi trigger / policy)
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;

-- -----------------------------------------------------------------------------
-- 2) Đảm bảo public.users có PRIMARY KEY trên id (bắt buộc cho favorites FK)
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'admin');
  end if;
end $$;

alter table public.users add column if not exists role public.user_role default 'user';
alter table public.users add column if not exists email text;
alter table public.users add column if not exists created_at timestamptz default now();
alter table public.users add column if not exists updated_at timestamptz default now();

delete from public.users where id is null;

delete from public.users u
where u.ctid not in (
  select min(u2.ctid)
  from public.users u2
  where u2.id is not null
  group by u2.id
);

alter table public.users alter column id set not null;

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
        select format('alter table public.users drop constraint %I', c.conname)
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

create unique index if not exists users_email_key on public.users (email);

-- -----------------------------------------------------------------------------
-- 3) Cột hồ sơ thành viên trên users
-- -----------------------------------------------------------------------------
alter table public.users add column if not exists full_name text;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists address text;
alter table public.users add column if not exists birthday date;
alter table public.users add column if not exists gender text;

alter table public.users add column if not exists newsletter_opt_in boolean;
alter table public.users add column if not exists personalized_recommendations boolean;
alter table public.users add column if not exists personalized_ads boolean;

update public.users set newsletter_opt_in = false where newsletter_opt_in is null;
update public.users set personalized_recommendations = false where personalized_recommendations is null;
update public.users set personalized_ads = false where personalized_ads is null;

alter table public.users alter column newsletter_opt_in set default false;
alter table public.users alter column personalized_recommendations set default false;
alter table public.users alter column personalized_ads set default false;

-- NOT NULL chỉ khi không còn NULL (tránh lỗi trên bảng có dữ liệu cũ)
do $$
begin
  alter table public.users alter column newsletter_opt_in set not null;
exception
  when others then
    raise notice 'newsletter_opt_in NOT NULL: %', sqlerrm;
end $$;

do $$
begin
  alter table public.users alter column personalized_recommendations set not null;
exception
  when others then
    raise notice 'personalized_recommendations NOT NULL: %', sqlerrm;
end $$;

do $$
begin
  alter table public.users alter column personalized_ads set not null;
exception
  when others then
    raise notice 'personalized_ads NOT NULL: %', sqlerrm;
end $$;

-- -----------------------------------------------------------------------------
-- 4) orders — chỉ khi bảng đã tồn tại
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'orders'
  ) then
    alter table public.orders add column if not exists subtotal numeric(12, 2);
    alter table public.orders add column if not exists discount_amount numeric(12, 2) default 0;
    alter table public.orders add column if not exists coupon_code text;
    alter table public.orders add column if not exists payment_method text;
    alter table public.orders add column if not exists is_preorder boolean not null default false;
    alter table public.orders add column if not exists shipping_full_name text;
    alter table public.orders add column if not exists shipping_phone text;
    alter table public.orders add column if not exists shipping_address text;
    alter table public.orders add column if not exists order_items jsonb;
  else
    raise notice 'Bỏ qua cột orders — chưa có bảng public.orders. Chạy ensure-products-orders.sql sau.';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 5) coupons
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'coupon_discount_type') then
    create type public.coupon_discount_type as enum ('percent', 'fixed');
  end if;
end $$;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type public.coupon_discount_type not null default 'fixed',
  discount_value numeric(12, 2) not null check (discount_value > 0),
  min_order_amount numeric(12, 2) not null default 0 check (min_order_amount >= 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coupons_code_idx on public.coupons (lower(code));
create index if not exists coupons_active_idx on public.coupons (is_active);

drop trigger if exists coupons_set_updated_at on public.coupons;
create trigger coupons_set_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6) favorites (cần PK users — bước 2)
-- -----------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id uuid not null references public.users (id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);

-- -----------------------------------------------------------------------------
-- 7) RLS
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile fields" on public.users;
create policy "Users can update own profile fields"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

alter table public.coupons enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "Users manage own favorites" on public.favorites;
create policy "Users manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Anyone can read active coupons" on public.coupons;
create policy "Anyone can read active coupons"
  on public.coupons for select
  using (is_active = true);

drop policy if exists "Admins manage coupons" on public.coupons;
create policy "Admins manage coupons"
  on public.coupons for all
  using (public.is_admin())
  with check (public.is_admin());

notify pgrst, 'reload schema';

-- -----------------------------------------------------------------------------
-- 8) Kiểm tra — phải thấy address, phone, newsletter_opt_in, ...
-- -----------------------------------------------------------------------------
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'users'
  and column_name in (
    'full_name',
    'phone',
    'address',
    'birthday',
    'gender',
    'newsletter_opt_in',
    'personalized_recommendations',
    'personalized_ads'
  )
order by column_name;
