begin;

create or replace function public.get_workspace_project(
  p_project_id uuid
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_project public.projects;
begin
  if v_user_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select *
    into v_project
  from public.projects
  where id = p_project_id
    and user_id = v_user_id;

  return v_project;
end;
$$;

create or replace function public.mark_workspace_project_ready(
  p_project_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  update public.projects
  set status = 'ready'
  where id = p_project_id
    and user_id = v_user_id;

  if not found then
    raise exception 'PROJECT_NOT_FOUND';
  end if;
end;
$$;

create or replace function public.save_workspace_generated_copy(
  p_project_id uuid,
  p_generated_html text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_updated boolean := false;
begin
  if v_user_id is null then
    raise exception 'UNAUTHORIZED';
  end if;

  update public.projects
  set status = 'generated',
      generated_html = p_generated_html
  where id = p_project_id
    and user_id = v_user_id
    and generated_html is null;

  v_updated := found;
  return v_updated;
end;
$$;

commit;
