-- =========================================================
-- Stusport payment + fulfillment migration
-- Run this in Supabase SQL Editor
-- =========================================================

begin;

-- =========================================================
-- 1) PRODUCTS: fulfillment_type
-- =========================================================

alter table public.products
add column if not exists fulfillment_type text not null default 'in_stock';

alter table public.products
  drop constraint if exists products_fulfillment_type_check;

alter table public.products
add constraint products_fulfillment_type_check
check (fulfillment_type in ('in_stock', 'pre_order'));

create index if not exists idx_products_fulfillment_type
  on public.products (fulfillment_type);


-- =========================================================
-- 2) ORDERS: payment / deposit fields
-- =========================================================

alter table public.orders
add column if not exists deposit_amount numeric(12,0) not null default 0,
add column if not exists remaining_amount numeric(12,0) not null default 0,
add column if not exists payment_method text,
add column if not exists payment_gateway text,
add column if not exists payment_reference text,
add column if not exists payment_paid_at timestamptz,
add column if not exists is_preorder boolean not null default false;

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
add constraint orders_status_check
check (
  status in (
    'pending',
    'pending_payment',
    'deposit_paid',
    'payment_verified',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  )
);

alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
add constraint orders_payment_method_check
check (
  payment_method is null or payment_method in (
    'cod',
    'bank_transfer',
    'preorder_deposit',
    'cod_deposit',
    'bank_transfer_full'
  )
);

alter table public.orders
  drop constraint if exists orders_payment_gateway_check;

alter table public.orders
add constraint orders_payment_gateway_check
check (
  payment_gateway is null or payment_gateway in ('payos', 'manual', 'cod')
);

create index if not exists idx_orders_status
  on public.orders (status);

create index if not exists idx_orders_payment_method
  on public.orders (payment_method);

create index if not exists idx_orders_payment_gateway
  on public.orders (payment_gateway);

create index if not exists idx_orders_payment_reference
  on public.orders (payment_reference);

create index if not exists idx_orders_payment_paid_at
  on public.orders (payment_paid_at);

create index if not exists idx_orders_is_preorder
  on public.orders (is_preorder);

create index if not exists idx_orders_created_at
  on public.orders (created_at desc);

create index if not exists idx_orders_deposit_amount
  on public.orders (deposit_amount);

create index if not exists idx_orders_remaining_amount
  on public.orders (remaining_amount);


-- =========================================================
-- 3) BACKFILL existing rows
-- =========================================================

update public.orders
set
  deposit_amount = coalesce(deposit_amount, 0),
  remaining_amount = coalesce(remaining_amount, greatest(total_price - coalesce(deposit_amount, 0), 0)),
  status = case
    when status = 'pending' then 'pending_payment'
    else status
  end
where status is not null;

update public.orders
set
  payment_gateway = coalesce(payment_gateway, 'manual'),
  payment_reference = coalesce(payment_reference, id::text)
where payment_gateway is null or payment_reference is null;

update public.products
set fulfillment_type = coalesce(fulfillment_type, 'in_stock')
where fulfillment_type is null;


-- =========================================================
-- 4) Helper function for deposit calculation
-- =========================================================

create or replace function public.calculate_deposit_amount(
  order_total numeric,
  is_preorder boolean,
  payment_method text
)
returns numeric
language sql
immutable
as $$
  select case
    when is_preorder then round(order_total * 0.5)
    when payment_method = 'cod_deposit' then least(100000, order_total)
    when payment_method = 'bank_transfer_full' then order_total
    else 0
  end
$$;

create table if not exists public.payment_webhook_logs (
  id bigserial primary key,
  provider text not null default 'payos',
  order_id text,
  event_type text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_webhook_logs_order_id
  on public.payment_webhook_logs (order_id);

create index if not exists idx_payment_webhook_logs_provider_created_at
  on public.payment_webhook_logs (provider, created_at desc);

commit;
