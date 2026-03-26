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
    status = case
      when p_approve then 'success'::public.payment_status
      else 'rejected'::public.payment_status
    end,
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

commit;
