-- Sửa bảng public.orders thiếu user_id / cột checkout
-- Chạy trong Supabase → SQL Editor (một lần), sau đó đợi ~30s hoặc Settings → API → Reload schema

-- Enum trạng thái đơn
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

-- Tạo bảng nếu chưa có
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  total_price numeric(12, 2) not null default 0 check (total_price >= 0),
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bổ sung cột thường thiếu (kể cả user_id)
alter table public.orders add column if not exists user_id uuid;
alter table public.orders add column if not exists total_price numeric(12, 2);
alter table public.orders add column if not exists status public.order_status;
alter table public.orders add column if not exists created_at timestamptz not null default now();
alter table public.orders add column if not exists updated_at timestamptz not null default now();
alter table public.orders add column if not exists subtotal numeric(12, 2);
alter table public.orders add column if not exists discount_amount numeric(12, 2) default 0;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists is_preorder boolean not null default false;
alter table public.orders add column if not exists shipping_full_name text;
alter table public.orders add column if not exists shipping_phone text;
alter table public.orders add column if not exists shipping_address text;
alter table public.orders add column if not exists order_items jsonb;

-- Mặc định status nếu cột vừa thêm
update public.orders set status = 'pending' where status is null;

alter table public.orders alter column status set default 'pending';

do $$
begin
  alter table public.orders alter column status set not null;
exception
  when others then
    raise notice 'orders.status NOT NULL: %', sqlerrm;
end $$;

-- FK user_id → users (nếu bảng users tồn tại)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'users'
  ) and not exists (
    select 1 from pg_constraint
    where conname = 'orders_user_id_fkey'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_user_id_fkey
      foreign key (user_id) references public.users (id) on delete set null;
  end if;
exception
  when others then
    raise notice 'orders_user_id_fkey: %', sqlerrm;
end $$;

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- RLS
alter table public.orders enable row level security;

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admins can read all orders" on public.orders;
create policy "Admins can read all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

notify pgrst, 'reload schema';
