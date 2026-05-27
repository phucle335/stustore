-- Chạy file này nếu lỗi: function public.is_admin() does not exist
-- (thường xảy ra khi chạy auth-user-trigger.sql trước admin-schema.sql)

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;
