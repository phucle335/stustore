-- Support requests (Contact/Zalo) ------------------------------------------------
-- Tạo bảng để lưu yêu cầu hỗ trợ từ form Contact ở footer.
-- -----------------------------------------------------------------------------

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  message text not null,
  status text not null default 'open'
    check (status in ('open', 'resolved')),
  -- Không gắn FK cứng để tránh lỗi nếu bảng users đang thiếu PK/unique.
  -- Nếu đã sửa users PK ổn định, có thể thêm FK lại ở migration riêng.
  handled_by uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_requests_status_idx
  on public.support_requests (status);

create index if not exists support_requests_created_at_idx
  on public.support_requests (created_at desc);

-- Trigger updated_at (dùng lại hàm set_updated_at có sẵn từ admin-schema.sql)
drop trigger if exists support_requests_set_updated_at on public.support_requests;
create trigger support_requests_set_updated_at
  before update on public.support_requests
  for each row
  execute function public.set_updated_at();

-- Row Level Security
alter table public.support_requests enable row level security;

-- Public can insert (hoặc service_role bypass RLS vẫn hoạt động).
create policy "Public can insert support requests"
  on public.support_requests for insert
  with check (true);

-- Admin read
create policy "Admins can read support requests"
  on public.support_requests for select
  using (public.is_admin());

-- Admin update
create policy "Admins can update support requests"
  on public.support_requests for update
  using (public.is_admin())
  with check (public.is_admin());

notify pgrst, 'reload schema';

