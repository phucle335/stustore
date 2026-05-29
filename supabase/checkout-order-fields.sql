-- Cột checkout — nếu lỗi user_id, chạy repair-orders-table.sql (khuyến nghị)

alter table public.orders add column if not exists user_id uuid;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists is_preorder boolean not null default false;
alter table public.orders add column if not exists shipping_full_name text;
alter table public.orders add column if not exists shipping_phone text;
alter table public.orders add column if not exists shipping_address text;
alter table public.orders add column if not exists order_items jsonb;

notify pgrst, 'reload schema';
