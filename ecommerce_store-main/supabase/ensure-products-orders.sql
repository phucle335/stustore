-- =============================================================================
-- Tạo bảng products + orders nếu thiếu
-- Chạy trong Supabase SQL Editor SAU khi đã có public.users
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Bước 0: Bắt buộc đã chạy repair-users-primary-key.sql trước
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    join pg_attribute a on a.attrelid = t.oid and a.attnum = any (c.conkey)
    where n.nspname = 'public'
      and t.relname = 'users'
      and c.contype = 'p'
      and a.attname = 'id'
  ) then
    raise exception
      'public.users chưa có PRIMARY KEY trên id. '
      'Chạy TRƯỚC file: supabase/repair-users-primary-key.sql';
  end if;
end $$;

-- order_status enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    );
  end if;
end $$;

-- products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_tag text not null,
  category text not null default 'sneakers'
    check (category in ('sneakers', 'sunglasses', 'clothing', 'bags', 'watches')),
  price numeric(12, 2) not null check (price >= 0),
  description text,
  images text[] not null default '{}',
  sizes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_sizes_is_array check (jsonb_typeof(sizes) = 'array')
);

create index if not exists products_brand_tag_idx on public.products (brand_tag);
create index if not exists products_created_at_idx on public.products (created_at desc);

-- Bảng products đã tồn tại từ trước → bổ sung cột thiếu (images, sizes, …)
alter table public.products add column if not exists brand_tag text;
alter table public.products add column if not exists category text not null default 'sneakers';
alter table public.products add column if not exists description text;
alter table public.products add column if not exists images text[] not null default '{}';
alter table public.products add column if not exists sizes jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists created_at timestamptz not null default now();
alter table public.products add column if not exists updated_at timestamptz not null default now();

create index if not exists products_category_idx on public.products (category);

notify pgrst, 'reload schema';

-- orders (tạo không FK trước, thêm FK sau — tránh lỗi 42830)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  total_price numeric(12, 2) not null check (total_price >= 0),
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_user_id_fkey'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_user_id_fkey
      foreign key (user_id) references public.users (id) on delete set null;
  end if;
end $$;

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- is_admin (nếu thiếu)
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

-- RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products"
  on public.products for select
  using (true);

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can read all orders" on public.orders;
create policy "Admins can read all orders"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- Bắt buộc: PostgREST cần reload schema cache
notify pgrst, 'reload schema';
