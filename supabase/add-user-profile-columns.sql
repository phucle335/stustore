-- Chỉ thêm cột hồ sơ trên public.users (không tạo coupons/favorites).
-- Dùng khi member-features.sql báo lỗi ở phần sau nhưng bạn chỉ cần cột profile.

alter table public.users add column if not exists full_name text;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists address text;
alter table public.users add column if not exists birthday date;
alter table public.users add column if not exists gender text;
alter table public.users add column if not exists newsletter_opt_in boolean default false;
alter table public.users add column if not exists personalized_recommendations boolean default false;
alter table public.users add column if not exists personalized_ads boolean default false;

notify pgrst, 'reload schema';

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'users'
  and column_name in ('address', 'phone', 'full_name', 'birthday', 'gender')
order by column_name;
