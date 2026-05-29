-- =============================================================================
-- Sửa bảng public.products — cột image_url_1 … image_url_5 (khớp Admin + CSV)
-- Chạy khi lỗi schema cache hoặc thiếu cột ảnh
-- =============================================================================

alter table public.products add column if not exists brand_tag text;
alter table public.products add column if not exists category text not null default 'sneakers';
alter table public.products add column if not exists description text;
alter table public.products add column if not exists sizes jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists created_at timestamptz not null default now();
alter table public.products add column if not exists updated_at timestamptz not null default now();

alter table public.products add column if not exists image_url_1 text;
alter table public.products add column if not exists image_url_2 text;
alter table public.products add column if not exists image_url_3 text;
alter table public.products add column if not exists image_url_4 text;
alter table public.products add column if not exists image_url_5 text;

-- sale_percent (Phase 2)
alter table public.products add column if not exists sale_percent numeric;
alter table public.products
  alter column sale_percent set default 0;
update public.products
set sale_percent = 0
where sale_percent is null;

alter table public.products drop constraint if exists products_sale_percent_check;
alter table public.products
  add constraint products_sale_percent_check
  check (sale_percent >= 0 and sale_percent <= 50);

-- Cột images[] cũ (nếu có) → gộp sang image_url_1…5
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'images'
  ) then
    update public.products p
    set
      image_url_1 = coalesce(nullif(trim(image_url_1), ''), p.images[1]),
      image_url_2 = coalesce(nullif(trim(image_url_2), ''), p.images[2]),
      image_url_3 = coalesce(nullif(trim(image_url_3), ''), p.images[3]),
      image_url_4 = coalesce(nullif(trim(image_url_4), ''), p.images[4]),
      image_url_5 = coalesce(nullif(trim(image_url_5), ''), p.images[5])
    where p.images is not null and cardinality(p.images) > 0;
  end if;
end $$;

update public.products
set brand_tag = coalesce(nullif(trim(brand_tag), ''), 'stusport')
where brand_tag is null or trim(brand_tag) = '';

update public.products
set category = 'sneakers'
where category is null
   or trim(category) = ''
   or category not in ('sneakers', 'sunglasses', 'clothing', 'bags', 'watches');

update public.products set sizes = '[]'::jsonb where sizes is null;

alter table public.products drop constraint if exists products_category_check;
alter table public.products
  add constraint products_category_check
  check (category in ('sneakers', 'sunglasses', 'clothing', 'bags', 'watches'));

alter table public.products drop constraint if exists products_sizes_is_array;
alter table public.products
  add constraint products_sizes_is_array
  check (jsonb_typeof(sizes) = 'array');

create index if not exists products_brand_tag_idx on public.products (brand_tag);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_created_at_idx on public.products (created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

notify pgrst, 'reload schema';
