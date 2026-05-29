-- Analytics — chạy trong Supabase SQL Editor
-- Theo dõi pageview, presence (realtime), sự kiện click

create table if not exists public.analytics_presence (
  session_id text primary key,
  path text not null default '/',
  referrer text,
  user_agent text,
  device_type text,
  country_code text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.analytics_page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  path text not null,
  title text,
  referrer text,
  product_id text,
  device_type text,
  country_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null,
  label text,
  path text,
  product_id text,
  device_type text,
  country_code text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_page_views_created_at_idx
  on public.analytics_page_views (created_at desc);

create index if not exists analytics_page_views_session_idx
  on public.analytics_page_views (session_id);

create index if not exists analytics_presence_last_seen_idx
  on public.analytics_presence (last_seen_at desc);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

-- RLS: chỉ server (service role) ghi/đọc — client gọi API Next.js
alter table public.analytics_presence enable row level security;
alter table public.analytics_page_views enable row level security;
alter table public.analytics_events enable row level security;
