-- Admin audit logs + notifications ------------------------------------------
-- Run in Supabase SQL Editor
-- -----------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- =============================================================================
-- 1) Admin audit log
-- =============================================================================

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  diff jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc);

-- =============================================================================
-- 2) Notifications
-- =============================================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null
    check (type in ('admin_action', 'support_request', 'order_event')),
  title text not null,
  body text,
  entity_type text,
  entity_id text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_created_at_idx
  on public.notifications (created_at desc);
create index if not exists notifications_type_created_at_idx
  on public.notifications (type, created_at desc);

-- =============================================================================
-- RLS
-- =============================================================================

alter table public.admin_audit_logs enable row level security;
alter table public.notifications enable row level security;

-- Admin can read logs
drop policy if exists "Admins can read admin_audit_logs" on public.admin_audit_logs;
create policy "Admins can read admin_audit_logs"
  on public.admin_audit_logs for select
  using (public.is_admin());

-- Admin can insert logs (service_role bypasses anyway, but keep consistent)
drop policy if exists "Admins can insert admin_audit_logs" on public.admin_audit_logs;
create policy "Admins can insert admin_audit_logs"
  on public.admin_audit_logs for insert
  with check (public.is_admin());

-- Admin notifications read
drop policy if exists "Admins can read notifications" on public.notifications;
create policy "Admins can read notifications"
  on public.notifications for select
  using (public.is_admin());

-- Public insert (service_role bypasses; allow anyway)
drop policy if exists "Public can insert notifications" on public.notifications;
create policy "Public can insert notifications"
  on public.notifications for insert
  with check (true);

