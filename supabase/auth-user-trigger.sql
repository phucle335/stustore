-- =============================================================================
-- Auto-sync Supabase Auth users → public.users
-- Run in Supabase SQL Editor
--
-- - New signups: insert row into public.users
-- - workspaceplace22@gmail.com → role = 'admin'
-- - All other emails → role = 'user'
-- =============================================================================

-- Ensure enum + table exist (safe if you already ran admin-schema.sql)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'admin');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Function: insert / update profile on auth.users INSERT
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_role public.user_role;
begin
  v_email := lower(trim(coalesce(new.email, new.raw_user_meta_data ->> 'email', '')));

  if v_email = '' then
    raise exception 'auth.users row has no email';
  end if;

  v_role := case
    when v_email = 'workspaceplace22@gmail.com' then 'admin'::public.user_role
    else 'user'::public.user_role
  end;

  if exists (select 1 from public.users u where u.id = new.id) then
    update public.users
    set
      email = v_email,
      role = v_role,
      updated_at = now()
    where id = new.id;
  else
    insert into public.users (id, email, role)
    values (new.id, v_email, v_role);
  end if;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Trigger: AFTER INSERT on auth.users
-- -----------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- Backfill: users already in Auth but missing from public.users
-- (e.g. account created before this trigger existed)
-- -----------------------------------------------------------------------------
insert into public.users (id, email, role)
select
  au.id,
  lower(trim(au.email)) as email,
  case
    when lower(trim(au.email)) = 'workspaceplace22@gmail.com' then 'admin'::public.user_role
    else 'user'::public.user_role
  end as role
from auth.users au
where au.email is not null
  and trim(au.email) <> ''
  and not exists (
    select 1 from public.users u where u.id = au.id
  );

-- Ensure workspace admin email always has admin role
update public.users
set role = 'admin', updated_at = now()
where lower(email) = 'workspaceplace22@gmail.com';

-- -----------------------------------------------------------------------------
-- is_admin() — tạo nếu chưa chạy admin-schema.sql (middleware/login cần hàm này)
-- -----------------------------------------------------------------------------
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
