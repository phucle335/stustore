-- Thêm danh mục sản phẩm (đồng bộ storefront ↔ admin)
-- Chạy trong Supabase SQL Editor sau admin-schema.sql
--
-- Nếu lỗi thiếu cột images/sizes → chạy repair-products-columns.sql

alter table public.products
  add column if not exists category text not null default 'sneakers';

alter table public.products
  drop constraint if exists products_category_check;

alter table public.products
  add constraint products_category_check
  check (
    category in ('sneakers', 'sunglasses', 'clothing', 'bags', 'watches')
  );

create index if not exists products_category_idx on public.products (category);

comment on column public.products.category is
  'Danh mục storefront: sneakers | sunglasses | clothing | bags | watches';
