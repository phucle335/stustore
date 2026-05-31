-- Mã sản phẩm tự đặt (admin) — id vẫn là UUID nội bộ
alter table public.products
  add column if not exists product_code text;

create unique index if not exists products_product_code_unique_idx
  on public.products (lower(product_code))
  where product_code is not null and trim(product_code) <> '';

notify pgrst, 'reload schema';
