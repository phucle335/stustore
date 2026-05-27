-- Thêm cột tên hiển thị cho khách hàng
alter table public.users
  add column if not exists full_name text;

-- Backfill từ metadata Auth (nếu có)
update public.users u
set full_name = coalesce(
  nullif(trim(au.raw_user_meta_data ->> 'full_name'), ''),
  u.full_name
)
from auth.users au
where au.id = u.id
  and (u.full_name is null or trim(u.full_name) = '');

notify pgrst, 'reload schema';
