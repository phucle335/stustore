-- Analytics v2 — chạy sau analytics.sql
-- Thiết bị, quốc gia, lượt xem / click theo sản phẩm

alter table public.analytics_presence
  add column if not exists device_type text,
  add column if not exists country_code text;

alter table public.analytics_page_views
  add column if not exists product_id text,
  add column if not exists device_type text,
  add column if not exists country_code text;

alter table public.analytics_events
  add column if not exists product_id text,
  add column if not exists device_type text,
  add column if not exists country_code text;

create index if not exists analytics_page_views_product_id_idx
  on public.analytics_page_views (product_id)
  where product_id is not null;

create index if not exists analytics_events_product_id_idx
  on public.analytics_events (product_id)
  where product_id is not null;

create index if not exists analytics_events_event_name_idx
  on public.analytics_events (event_name, created_at desc);
