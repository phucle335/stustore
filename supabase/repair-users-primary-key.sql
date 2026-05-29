-- =============================================================================
-- SỬA LỖI 42830: "no unique constraint matching given keys for referenced table users"
--
-- Chạy TOÀN BỘ file này trong Supabase SQL Editor (một lần).
-- Sau đó chạy ensure-products-orders.sql
-- =============================================================================

create extension if not exists "pgcrypto";

-- Enum user_role (nếu thiếu)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'admin');
  end if;
end $$;

-- Đảm bảo bảng users tồn tại với cột id
create table if not exists public.users (
  id uuid,
  email text,
  role public.user_role default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Xóa dòng id NULL (không thể làm PK)
delete from public.users where id is null;

-- Xóa id trùng — giữ một dòng (ctid nhỏ nhất)
delete from public.users u
where u.ctid not in (
  select min(u2.ctid)
  from public.users u2
  where u2.id is not null
  group by u2.id
);

-- Bắt buộc NOT NULL trên id
alter table public.users alter column id set not null;

-- Đồng bộ user từ Auth nếu public.users trống / thiếu
insert into public.users (id, email, role)
select
  au.id,
  lower(trim(au.email)),
  case
    when lower(trim(au.email)) = 'workspaceplace22@gmail.com' then 'admin'::public.user_role
    else 'user'::public.user_role
  end
from auth.users au
where au.email is not null
  and trim(au.email) <> ''
  and not exists (select 1 from public.users u where u.id = au.id);

-- Thêm PRIMARY KEY (bỏ PK cũ tên khác nếu có — chỉ khi chưa có PK trên id)
do $$
declare
  v_has_pk_on_id boolean;
begin
  select exists (
    select 1
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    join pg_attribute a on a.attrelid = t.oid and a.attnum = any (c.conkey)
    where n.nspname = 'public'
      and t.relname = 'users'
      and c.contype = 'p'
      and a.attname = 'id'
  ) into v_has_pk_on_id;

  if not v_has_pk_on_id then
    -- Bỏ PRIMARY KEY cũ (nếu PK không nằm trên cột id)
    if exists (
      select 1
      from pg_constraint c
      join pg_class t on c.conrelid = t.oid
      join pg_namespace n on t.relnamespace = n.oid
      where n.nspname = 'public'
        and t.relname = 'users'
        and c.contype = 'p'
    ) then
      execute (
        select format(
          'alter table public.users drop constraint %I',
          c.conname
        )
        from pg_constraint c
        join pg_class t on c.conrelid = t.oid
        join pg_namespace n on t.relnamespace = n.oid
        where n.nspname = 'public'
          and t.relname = 'users'
          and c.contype = 'p'
        limit 1
      );
    end if;

    alter table public.users add primary key (id);
  end if;
end $$;

-- FK tới auth.users (nếu chưa có)
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    where t.relname = 'users'
      and c.conname = 'users_id_fkey'
  ) then
    alter table public.users
      add constraint users_id_fkey
      foreign key (id) references auth.users (id) on delete cascade;
  end if;
exception
  when duplicate_object then null;
  when others then
    raise notice 'users_id_fkey: % (có thể đã tồn tại với tên khác)', sqlerrm;
end $$;

create unique index if not exists users_email_key on public.users (email);

-- Gán admin mặc định
update public.users
set role = 'admin', updated_at = now()
where lower(email) = 'workspaceplace22@gmail.com';

notify pgrst, 'reload schema';

-- Kiểm tra (phải thấy 1 dòng primary)
select
  c.conname as constraint_name,
  c.contype as type
from pg_constraint c
join pg_class t on c.conrelid = t.oid
join pg_namespace n on t.relnamespace = n.oid
where n.nspname = 'public'
  and t.relname = 'users'
  and c.contype in ('p', 'u');
