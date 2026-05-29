alter table if exists public.products
add column if not exists product_status text not null default 'selling';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_product_status_check'
  ) then
    alter table public.products
      add constraint products_product_status_check
      check (product_status in ('selling', 'out_of_stock', 'paused'));
  end if;
end $$;

notify pgrst, 'reload schema';
