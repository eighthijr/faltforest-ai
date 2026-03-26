begin;

alter table public.payments
  add column if not exists proof_path text;

create or replace function public.submit_manual_qris_proof(
  p_user_id uuid,
  p_project_id uuid,
  p_reference text,
  p_amount numeric,
  p_proof_path text
)
returns public.payments
language plpgsql
security definer
as $$
declare
  v_payment public.payments;
begin
  insert into public.payments (user_id, project_id, reference, amount, status, gateway, proof_path)
  values (p_user_id, p_project_id, p_reference, p_amount, 'pending', 'manual_qris', p_proof_path)
  on conflict (reference)
  do update
    set proof_path = excluded.proof_path
  returning * into v_payment;

  update public.payments
  set
    status = case
      when status in ('pending', 'waiting_confirmation') then 'waiting_confirmation'::public.payment_status
      else status
    end,
    proof_path = coalesce(p_proof_path, proof_path)
  where reference = p_reference
    and user_id = p_user_id
  returning * into v_payment;

  return v_payment;
end;
$$;

commit;
