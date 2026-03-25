-- Analytics SQL: indexes, dashboard queries, and aggregation functions.

-- Suggested indexes for events analytics workloads.
create index if not exists events_event_name_created_at_idx
  on public.events (event_name, created_at desc);

create index if not exists events_created_at_idx
  on public.events (created_at desc);

create index if not exists events_user_id_created_at_idx
  on public.events (user_id, created_at desc)
  where user_id is not null;

-- Dashboard metric: total users (from auth users table).
create or replace function public.analytics_total_users()
returns bigint
language sql
security definer
as $$
  select count(*)::bigint from auth.users;
$$;

-- Daily metrics by date for tracked events.
create or replace function public.analytics_daily_metrics(
  p_from timestamptz,
  p_to timestamptz
)
returns table (
  metric_date date,
  page_view bigint,
  cta_click bigint,
  login_success bigint,
  project_created bigint,
  generation_completed bigint,
  payment_success bigint
)
language sql
security definer
as $$
with dates as (
  select generate_series(date_trunc('day', p_from), date_trunc('day', p_to), interval '1 day') as day
),
base as (
  select
    date_trunc('day', created_at) as day,
    event_name,
    count(*)::bigint as total
  from public.events
  where created_at >= p_from
    and created_at < p_to
    and event_name in (
      'page_view',
      'cta_click',
      'login_success',
      'project_created',
      'generation_completed',
      'payment_success'
    )
  group by 1, 2
)
select
  d.day::date as metric_date,
  coalesce(sum(case when b.event_name = 'page_view' then b.total end), 0)::bigint as page_view,
  coalesce(sum(case when b.event_name = 'cta_click' then b.total end), 0)::bigint as cta_click,
  coalesce(sum(case when b.event_name = 'login_success' then b.total end), 0)::bigint as login_success,
  coalesce(sum(case when b.event_name = 'project_created' then b.total end), 0)::bigint as project_created,
  coalesce(sum(case when b.event_name = 'generation_completed' then b.total end), 0)::bigint as generation_completed,
  coalesce(sum(case when b.event_name = 'payment_success' then b.total end), 0)::bigint as payment_success
from dates d
left join base b on b.day = d.day
group by 1
order by 1;
$$;

-- Funnel (unique users in each step) and conversion from previous step.
create or replace function public.analytics_funnel(
  p_from timestamptz,
  p_to timestamptz
)
returns table (
  step text,
  users bigint,
  conversion_from_prev numeric
)
language sql
security definer
as $$
with scoped as (
  select user_id, event_name
  from public.events
  where created_at >= p_from
    and created_at < p_to
    and user_id is not null
    and event_name in (
      'page_view',
      'cta_click',
      'login_success',
      'project_created',
      'generation_completed',
      'payment_success'
    )
),
steps as (
  select 1 as seq, 'page_view'::text as step, count(distinct user_id)::bigint as users from scoped where event_name = 'page_view'
  union all
  select 2, 'cta_click', count(distinct user_id)::bigint from scoped where event_name = 'cta_click'
  union all
  select 3, 'login_success', count(distinct user_id)::bigint from scoped where event_name = 'login_success'
  union all
  select 4, 'project_created', count(distinct user_id)::bigint from scoped where event_name = 'project_created'
  union all
  select 5, 'generation_completed', count(distinct user_id)::bigint from scoped where event_name = 'generation_completed'
  union all
  select 6, 'payment_success', count(distinct user_id)::bigint from scoped where event_name = 'payment_success'
),
with_prev as (
  select
    step,
    users,
    lag(users) over(order by seq) as prev_users,
    seq
  from steps
)
select
  step,
  users,
  case
    when seq = 1 then 1
    when coalesce(prev_users, 0) = 0 then 0
    else round(users::numeric / prev_users::numeric, 4)
  end as conversion_from_prev
from with_prev
order by seq;
$$;

-- Example dashboard query (single call):
-- select jsonb_build_object(
--   'total_users', public.analytics_total_users(),
--   'daily_metrics', (select jsonb_agg(t) from public.analytics_daily_metrics(now() - interval '30 days', now()) t),
--   'funnel', (select jsonb_agg(f) from public.analytics_funnel(now() - interval '30 days', now()) f)
-- );
