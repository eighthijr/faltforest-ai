begin;

create or replace function public.delete_project_atomic(
  p_user_id uuid,
  p_project_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_active_payment_count integer;
begin
  select user_id
    into v_owner_id
  from public.projects
  where id = p_project_id;

  if v_owner_id is null then
    raise exception 'PROJECT_NOT_FOUND';
  end if;

  if v_owner_id <> p_user_id then
    raise exception 'FORBIDDEN';
  end if;

  select count(1)
    into v_active_payment_count
  from public.payments
  where project_id = p_project_id
    and status in ('pending', 'waiting_confirmation');

  if v_active_payment_count > 0 then
    raise exception 'PROJECT_DELETE_BLOCKED_ACTIVE_PAYMENT';
  end if;

  delete from public.projects
  where id = p_project_id
    and user_id = p_user_id;

  return true;
end;
$$;

grant execute on function public.delete_project_atomic(uuid, uuid) to authenticated;

commit;
