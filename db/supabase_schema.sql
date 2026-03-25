-- Production-safe schema for Supabase PostgreSQL
-- Notes:
-- 1) Assumes Supabase Auth users table exists at auth.users(id uuid).
-- 2) Uses enum types for strict status/type control.

begin;

-- =========================
-- Enum types
-- =========================
create type public.project_type as enum ('free', 'premium');
create type public.project_status as enum ('draft', 'ready', 'generated');
create type public.payment_status as enum (
  'pending',
  'waiting_confirmation',
  'success',
  'rejected'
);

-- =========================
-- projects
-- =========================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.project_type not null,
  status public.project_status not null default 'draft',
  generated_html text,
  created_at timestamptz not null default timezone('utc', now())
);

-- CRITICAL: only 1 FREE project per user
create unique index projects_one_free_per_user_idx
  on public.projects (user_id)
  where type = 'free';

-- Helpful indexes
create index projects_user_id_idx on public.projects (user_id);
create index projects_created_at_idx on public.projects (created_at desc);
create index projects_user_status_idx on public.projects (user_id, status);

-- =========================
-- payments
-- =========================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  reference text not null,
  amount numeric(12,2) not null check (amount > 0),
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),

  -- CRITICAL: payment reference must be unique
  constraint payments_reference_unique unique (reference)
);

-- CRITICAL: only 1 active payment per project
-- Active statuses are pending and waiting_confirmation.
create unique index payments_one_active_per_project_idx
  on public.payments (project_id)
  where status in ('pending', 'waiting_confirmation');

-- Helpful indexes
create index payments_user_id_idx on public.payments (user_id);
create index payments_project_id_idx on public.payments (project_id);
create index payments_status_idx on public.payments (status);
create index payments_created_at_idx on public.payments (created_at desc);

-- =========================
-- events
-- =========================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null check (char_length(trim(event_name)) > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- Helpful indexes
create index events_user_id_idx on public.events (user_id);
create index events_event_name_idx on public.events (event_name);
create index events_created_at_idx on public.events (created_at desc);
create index events_metadata_gin_idx on public.events using gin (metadata);

-- Optional consistency trigger: prevent mismatched payment.user_id and project.user_id
create or replace function public.enforce_payment_project_owner_match()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.projects p
    where p.id = new.project_id
      and p.user_id = new.user_id
  ) then
    raise exception 'payments.user_id must match projects.user_id for project_id %', new.project_id;
  end if;

  return new;
end;
$$;

create trigger trg_enforce_payment_project_owner_match
before insert or update of user_id, project_id
on public.payments
for each row
execute function public.enforce_payment_project_owner_match();

commit;
