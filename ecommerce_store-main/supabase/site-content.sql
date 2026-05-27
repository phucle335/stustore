-- Site Content CMS (Motto / Home) ------------------------------------------------
-- Lưu trữ nội dung cấu hình theo key trong bảng `public.site_settings`.
-- Dùng cho Phase 1 (hero slides, rotating words, marquee, MottoInsights...).
-- -----------------------------------------------------------------------------

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists site_settings_updated_at_idx on public.site_settings(updated_at desc);

-- Triggers: cập nhật `updated_at`
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

-- Select: public có thể đọc
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

-- Update: admin mới được cập nhật
create policy "Admins can update site settings"
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- Insert: admin mới được insert
create policy "Admins can insert site settings"
  on public.site_settings for insert
  with check (public.is_admin());

-- Delete: chỉ admin
create policy "Admins can delete site settings"
  on public.site_settings for delete
  using (public.is_admin());

