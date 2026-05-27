-- Phase 3: CMS Blog ----------------------------------------------------------
-- Cho phép admin chỉnh sửa title / excerpt / image / body.

create table if not exists public.blog_posts (
  id text primary key,
  title text not null,
  excerpt text not null,
  image text not null,
  date text,
  body text not null,
  updated_at timestamptz not null default now()
);

-- trigger updated_at (dùng chung function set_updated_at)
drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

-- Public đọc blog
create policy "Public can read blog posts"
  on public.blog_posts for select
  using (true);

-- Admin ghi blog
create policy "Admins can upsert blog posts"
  on public.blog_posts for all
  using (public.is_admin())
  with check (public.is_admin());

