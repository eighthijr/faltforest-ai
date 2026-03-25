import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { AnalyticsDashboard, DailyMetric, FunnelMetric, TrackedEventName } from './types';

const TRACKED_EVENTS: TrackedEventName[] = [
  'page_view',
  'cta_click',
  'login_success',
  'project_created',
  'generation_completed',
  'payment_success',
];

export async function trackEvent(input: {
  userId?: string | null;
  eventName: TrackedEventName;
  metadata?: Record<string, unknown>;
}) {
  if (!TRACKED_EVENTS.includes(input.eventName)) {
    throw new Error(`Unsupported event: ${input.eventName}`);
  }

  const { error } = await supabaseAdmin.from('events').insert({
    user_id: input.userId ?? null,
    event_name: input.eventName,
    metadata: input.metadata ?? {},
  });

  if (error) throw new Error(error.message);
}

export async function getTotalUsers(): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc('analytics_total_users');
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

export async function getDailyMetrics(params: { from: string; to: string }): Promise<DailyMetric[]> {
  const { data, error } = await supabaseAdmin.rpc('analytics_daily_metrics', {
    p_from: params.from,
    p_to: params.to,
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as DailyMetric[];
}

export async function getFunnel(params: { from: string; to: string }): Promise<FunnelMetric[]> {
  const { data, error } = await supabaseAdmin.rpc('analytics_funnel', {
    p_from: params.from,
    p_to: params.to,
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as FunnelMetric[];
}

export async function getAnalyticsDashboard(params: { from: string; to: string }): Promise<AnalyticsDashboard> {
  const [totalUsers, dailyMetrics, funnel] = await Promise.all([
    getTotalUsers(),
    getDailyMetrics(params),
    getFunnel(params),
  ]);

  return {
    totalUsers,
    dailyMetrics,
    funnel,
  };
}
