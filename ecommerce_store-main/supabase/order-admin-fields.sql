-- Extra fields for admin order editing screen

alter table public.orders
  add column if not exists order_meta jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';

