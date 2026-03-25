begin;

-- =========================
-- 1) Stronger DB constraints
-- =========================
alter table public.projects
  alter column type set not null,
  alter column status set not null,
  alter column user_id set not null;

alter table public.payments
  alter column user_id set not null,
  alter column project_id set not null,
  alter column reference set not null,
  alter column amount set not null,
  alter column status set not null;

alter table public.payments
  add constraint payments_success_has_confirmation
  check (
    status <> 'success'
    or confirmed_at is not null
  );

-- Guard invalid payment status transitions.
create or replace function public.guard_payment_status_transition()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.status <> new.status then
    if old.status = 'pending' and new.status not in ('waiting_confirmation', 'rejected') then
      raise exception 'Invalid transition from pending to %', new.status;
    end if;

    if old.status = 'waiting_confirmation' and new.status not in ('success', 'rejected') then
      raise exception 'Invalid transition from waiting_confirmation to %', new.status;
    end if;

    if old.status = 'success' and new.status <> 'success' then
      raise exception 'Cannot transition from success to %', new.status;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_payment_status_transition on public.payments;
create trigger trg_guard_payment_status_transition
before update on public.payments
for each row
execute function public.guard_payment_status_transition();

-- =========================
-- 2) Ownership & paywall enforcement helpers
-- =========================
create or replace function public.assert_project_ownership(
  p_user_id uuid,
  p_project_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1
    from public.projects
    where id = p_project_id
      and user_id = p_user_id
  ) then
    raise exception 'Project ownership validation failed';
  end if;
end;
$$;

create or replace function public.enforce_paywall_action(
  p_user_id uuid,
  p_project_id uuid,
  p_action text
)
returns void
language plpgsql
security definer
as $$
declare
  v_type public.project_type;
  v_status public.project_status;
begin
  select type, status
    into v_type, v_status
  from public.projects
  where id = p_project_id
    and user_id = p_user_id;

  if v_type is null then
    raise exception 'Project ownership validation failed';
  end if;

  if v_type = 'free' then
    if p_action in ('download', 'chat_after_generation', 'revision') and v_status = 'generated' then
      raise exception 'Paywall enforced for action %', p_action;
    end if;
  end if;
end;
$$;

-- =========================
-- 3) Race-safe project create + idempotency table
-- =========================
create table if not exists public.api_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  idempotency_key text not null,
  request_hash text not null,
  response jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint api_idempotency_keys_unique unique (scope, idempotency_key)
);

create or replace function public.create_project_atomic(
  p_user_id uuid,
  p_type public.project_type,
  p_idempotency_key text default null
)
returns public.projects
language plpgsql
security definer
as $$
declare
  v_project public.projects;
  v_existing_response jsonb;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text || ':project:create'));

  if p_idempotency_key is not null then
    select response into v_existing_response
    from public.api_idempotency_keys
    where scope = 'project:create'
      and idempotency_key = p_idempotency_key;

    if v_existing_response is not null then
      select * into v_project from public.projects where id = (v_existing_response->>'project_id')::uuid;
      return v_project;
    end if;
  end if;

  if p_type = 'free' and exists (
    select 1 from public.projects where user_id = p_user_id and type = 'free'
  ) then
    raise exception 'FREE_LIMIT_REACHED';
  end if;

  insert into public.projects (user_id, type, status)
  values (p_user_id, p_type, 'draft')
  returning * into v_project;

  if p_idempotency_key is not null then
    insert into public.api_idempotency_keys (scope, idempotency_key, request_hash, response)
    values (
      'project:create',
      p_idempotency_key,
      md5(p_user_id::text || ':' || p_type::text),
      jsonb_build_object('project_id', v_project.id)
    )
    on conflict (scope, idempotency_key)
    do update set response = excluded.response, updated_at = timezone('utc', now());
  end if;

  insert into public.events (user_id, event_name, metadata)
  values (p_user_id, 'project_created', jsonb_build_object('project_id', v_project.id, 'type', v_project.type));

  return v_project;
end;
$$;

commit;
