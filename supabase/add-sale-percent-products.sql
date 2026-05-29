-- Phase 2: sale_percent cho bảng products
-- sale_percent dùng để tính giá sale và hiển thị giá gốc gạch.

alter table public.products
  add column if not exists sale_percent numeric;

-- Set default để các sản phẩm cũ tự thành 0% (không sale)
alter table public.products
  alter column sale_percent set default 0;

-- Nếu có dữ liệu null thì cập nhật về 0
update public.products
set sale_percent = 0
where sale_percent is null;

-- Giới hạn 0..50%
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_sale_percent_check'
  ) then
    alter table public.products
      add constraint products_sale_percent_check
      check (sale_percent >= 0 and sale_percent <= 50);
  end if;
end $$;

