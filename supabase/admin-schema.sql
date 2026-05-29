-- =============================================================================
-- Shoe store admin schema — run in Supabase SQL Editor
-- =============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('user', 'admin');

create type public.order_status as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- -----------------------------------------------------------------------------
-- users (profile linked to Supabase Auth)
-- -----------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bảng đã tạo trước đó (thiếu full_name)
alter table public.users
  add column if not exists full_name text;

create index users_role_idx on public.users (role);
create index users_email_idx on public.users (email);

-- Auto-create profile when someone signs up via Supabase Auth
-- workspaceplace22@gmail.com → admin; all others → user
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_role public.user_role;
begin
  v_email := lower(trim(coalesce(new.email, new.raw_user_meta_data ->> 'email', '')));

  if v_email = '' then
    raise exception 'auth.users row has no email';
  end if;

  v_role := case
    when v_email = 'workspaceplace22@gmail.com' then 'admin'::public.user_role
    else 'user'::public.user_role
  end;

  if exists (select 1 from public.users u where u.id = new.id) then
    update public.users
    set
      email = v_email,
      role = v_role,
      updated_at = now()
    where id = new.id;
  else
    insert into public.users (id, email, role)
    values (new.id, v_email, v_role);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- products
-- sizes: jsonb array, e.g. [{"size":"40","quantity":12},{"size":"41","quantity":8}]
-- -----------------------------------------------------------------------------
create table public.products (
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

create index products_brand_tag_idx on public.products (brand_tag);
create index products_category_idx on public.products (category);
create index products_created_at_idx on public.products (created_at desc);

-- -----------------------------------------------------------------------------
-- orders
-- -----------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  total_price numeric(12, 2) not null check (total_price >= 0),
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

-- -----------------------------------------------------------------------------
-- updated_at trigger
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

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Helper: true if current JWT user is admin
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

-- users policies
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Admins can read all users"
  on public.users for select
  using (public.is_admin());

create policy "Admins can update users"
  on public.users for update
  using (public.is_admin());

create policy "Admins can delete users"
  on public.users for delete
  using (public.is_admin());

-- products policies
create policy "Anyone can read products"
  on public.products for select
  using (true);

create policy "Admins manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- orders policies
create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Admins can read all orders"
  on public.orders for select
  using (public.is_admin());

create policy "Users can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- First admin is auto-assigned via trigger for workspaceplace22@gmail.com
-- -----------------------------------------------------------------------------
-- update public.users set role = 'admin' where lower(email) = 'workspaceplace22@gmail.com';
