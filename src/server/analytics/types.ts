export type TrackedEventName =
  | 'page_view'
  | 'cta_click'
  | 'login_success'
  | 'project_created'
  | 'generation_completed'
  | 'payment_success';

export type DailyMetric = {
  metric_date: string;
  page_view: number;
  cta_click: number;
  login_success: number;
  project_created: number;
  generation_completed: number;
  payment_success: number;
};

export type FunnelMetric = {
  step: TrackedEventName;
  users: number;
  conversion_from_prev: number;
};

export type AnalyticsDashboard = {
  totalUsers: number;
  dailyMetrics: DailyMetric[];
  funnel: FunnelMetric[];
};
