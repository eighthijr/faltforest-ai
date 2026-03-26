begin;

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

  if v_payment.id is not null and v_payment.status = 'success' then
    update public.projects
    set type = 'premium'
    where id = v_payment.project_id;
  end if;

  return v_payment;
end;
$$;

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
      when status = 'success' then status
      else v_next_status
    end,
    gateway = 'tripay_qris',
    gateway_ref = coalesce(gateway_ref, p_gateway_ref),
    confirmed_at = case when v_next_status = 'success' then timezone('utc', now()) else confirmed_at end
  where reference = p_reference
  returning * into v_payment;

  if v_payment.id is not null and v_payment.status = 'success' then
    update public.projects
    set type = 'premium'
    where id = v_payment.project_id;
  end if;

  return v_payment;
end;
$$;

commit;
