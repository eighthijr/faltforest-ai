begin;

-- Add operational columns for payment workflow tracking.
alter table public.payments
  add column if not exists gateway text not null default 'manual_qris',
  add column if not exists gateway_ref text,
  add column if not exists updated_at timestamptz not null default timezone('utc', now()),
  add column if not exists confirmed_by uuid references auth.users(id) on delete set null,
  add column if not exists confirmed_at timestamptz;

create index if not exists payments_gateway_idx on public.payments (gateway);
create index if not exists payments_gateway_ref_idx on public.payments (gateway_ref);

-- Idempotency registry for webhook callbacks.
create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  reference text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint payment_webhook_events_provider_event_unique unique (provider, event_id)
);

create index if not exists payment_webhook_events_reference_idx
  on public.payment_webhook_events(reference);

create or replace function public.set_payments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_set_payments_updated_at on public.payments;
create trigger trg_set_payments_updated_at
before update on public.payments
for each row
execute function public.set_payments_updated_at();

-- Manual QRIS create (idempotent by reference).
create or replace function public.create_manual_qris_payment(
  p_user_id uuid,
  p_project_id uuid,
  p_reference text,
  p_amount numeric
)
returns public.payments
language plpgsql
security definer
as $$
declare
  v_payment public.payments;
begin
  insert into public.payments (user_id, project_id, reference, amount, status, gateway)
  values (p_user_id, p_project_id, p_reference, p_amount, 'pending', 'manual_qris')
  on conflict (reference)
  do update set reference = excluded.reference
  returning * into v_payment;

  return v_payment;
end;
$$;

-- User confirms manual payment (pending -> waiting_confirmation only).
create or replace function public.mark_manual_payment_waiting_confirmation(
  p_user_id uuid,
  p_reference text
)
returns public.payments
language plpgsql
security definer
as $$
declare
  v_payment public.payments;
begin
  update public.payments
  set status = 'waiting_confirmation'
  where reference = p_reference
    and user_id = p_user_id
    and status = 'pending'
  returning * into v_payment;

  if v_payment.id is null then
    select * into v_payment from public.payments where reference = p_reference;
  end if;

  return v_payment;
end;
$$;

-- Admin-only approve/reject function (only waiting_confirmation can move).
create or replace function public.admin_decide_manual_payment(
  p_admin_id uuid,
  p_reference text,
  p_approve boolean
)
returns public.payments
language plpgsql
security definer
as $$
declare
  v_payment public.payments;
begin
  update public.payments
  set
    status = case when p_approve then 'success' else 'rejected' end,
    confirmed_by = p_admin_id,
    confirmed_at = timezone('utc', now())
  where reference = p_reference
    and status = 'waiting_confirmation'
  returning * into v_payment;

  if v_payment.id is null then
    select * into v_payment from public.payments where reference = p_reference;
  end if;

  return v_payment;
end;
$$;

-- Tripay create transaction record (idempotent by reference).
create or replace function public.create_tripay_qris_payment(
  p_user_id uuid,
  p_project_id uuid,
  p_reference text,
  p_amount numeric,
  p_gateway_ref text
)
returns public.payments
language plpgsql
security definer
as $$
declare
  v_payment public.payments;
begin
  insert into public.payments (user_id, project_id, reference, amount, status, gateway, gateway_ref)
  values (p_user_id, p_project_id, p_reference, p_amount, 'pending', 'tripay_qris', p_gateway_ref)
  on conflict (reference)
  do update set gateway_ref = coalesce(public.payments.gateway_ref, excluded.gateway_ref)
  returning * into v_payment;

  return v_payment;
end;
$$;

-- Tripay webhook processor: idempotent + transactional.
-- Only this function (or admin decision function) can mark payment as success.
create or replace function public.process_tripay_webhook(
  p_event_id text,
  p_reference text,
  p_gateway_ref text,
  p_tripay_status text,
  p_payload jsonb
)
returns public.payments
language plpgsql
security definer
as $$
declare
  v_inserted integer;
  v_next_status public.payment_status;
  v_payment public.payments;
begin
  insert into public.payment_webhook_events (provider, event_id, reference, payload)
  values ('tripay', p_event_id, p_reference, p_payload)
  on conflict (provider, event_id) do nothing;

  get diagnostics v_inserted = row_count;

  -- idempotent replay: return current payment without applying status transition again
  if v_inserted = 0 then
    select * into v_payment from public.payments where reference = p_reference;
    return v_payment;
  end if;

  v_next_status := case upper(p_tripay_status)
    when 'PAID' then 'success'::public.payment_status
    when 'EXPIRED' then 'rejected'::public.payment_status
    when 'FAILED' then 'rejected'::public.payment_status
    else 'pending'::public.payment_status
  end;

  update public.payments
  set
    status = case
      when status = 'success' then status -- never downgrade success
      else v_next_status
    end,
    gateway = 'tripay_qris',
    gateway_ref = coalesce(gateway_ref, p_gateway_ref),
    confirmed_at = case when v_next_status = 'success' then timezone('utc', now()) else confirmed_at end
  where reference = p_reference
  returning * into v_payment;

  return v_payment;
end;
$$;

commit;
