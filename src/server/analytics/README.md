# Analytics System

## Event table
Menggunakan tabel `events` dengan kolom:
- `user_id`
- `event_name`
- `metadata`
- `created_at`

## Tracked events
- `page_view`
- `cta_click`
- `login_success`
- `project_created`
- `generation_completed`
- `payment_success`

## Dashboard metrics
- total users: `analytics_total_users()`
- daily metrics: `analytics_daily_metrics(from, to)`
- funnel: `analytics_funnel(from, to)`

## SQL queries
Lihat: `db/queries/analytics_system.sql`

## Aggregation logic (backend)
- `trackEvent()` untuk insert event terstandar
- `getAnalyticsDashboard()` untuk agregasi total users + daily metrics + funnel (parallel)
- route admin-only:
  - `getDashboard`
  - `getDashboardTotalUsers`
  - `getDashboardDailyMetrics`
  - `getDashboardFunnel`
