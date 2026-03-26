begin;

-- Ensure authenticated users can write analytics events for themselves.
alter table public.events enable row level security;

-- Add insert policy idempotently to avoid 42501 on client/edge inserts.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'events'
      and policyname = 'events_insert_authenticated_own'
  ) then
    create policy events_insert_authenticated_own
      on public.events
      for insert
      to authenticated
      with check (
        user_id is null
        or user_id = auth.uid()
      );
  end if;
end;
$$;

commit;
