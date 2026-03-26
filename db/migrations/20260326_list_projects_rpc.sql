begin;

create or replace function public.list_projects_for_user(
  p_user_id uuid
)
returns setof public.projects
language sql
security definer
set search_path = public
as $$
  select p.*
  from public.projects p
  where p.user_id = p_user_id
  order by p.created_at desc;
$$;

commit;
