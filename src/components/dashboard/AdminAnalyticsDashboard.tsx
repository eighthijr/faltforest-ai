'use client';

import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DashboardLayout } from './DashboardLayout';

type DailyMetric = {
  metric_date: string;
  page_view: number;
  cta_click: number;
  login_success: number;
  project_created: number;
  generation_completed: number;
  payment_success: number;
};

type FunnelMetric = {
  step: string;
  users: number;
  conversion_from_prev: number;
};

type AnalyticsDashboard = {
  totalUsers: number;
  dailyMetrics: DailyMetric[];
  funnel: FunnelMetric[];
};

type AdminAnalyticsDashboardProps = {
  userId: string;
};

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function rangeToIso(fromDate: string, toDate: string) {
  return {
    from: new Date(`${fromDate}T00:00:00.000Z`).toISOString(),
    to: new Date(`${toDate}T23:59:59.999Z`).toISOString(),
  };
}

function formatPercent(value: number) {
  return `${Number.isFinite(value) ? value.toFixed(1) : '0.0'}%`;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function AdminAnalyticsDashboard({ userId }: AdminAnalyticsDashboardProps) {
  const today = useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = useState(toDateInputValue(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)));
  const [toDate, setToDate] = useState(toDateInputValue(today));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    const { from, to } = rangeToIso(fromDate, toDate);
    const response = await fetch(`/api/admin/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
      cache: 'no-store',
      headers: await getAuthHeaders(),
    });
    const data = (await response.json().catch(() => null)) as AnalyticsDashboard | { message?: string } | null;
    if (!response.ok) {
      setError((data as { message?: string } | null)?.message ?? 'Gagal memuat analytics.');
      setLoading(false);
      return;
    }
    setDashboard(data as AnalyticsDashboard);
    setLoading(false);
  };

  const totals = useMemo(() => {
    const metrics = dashboard?.dailyMetrics ?? [];
    return metrics.reduce(
      (acc, item) => ({
        pageView: acc.pageView + item.page_view,
        projectCreated: acc.projectCreated + item.project_created,
        paymentSuccess: acc.paymentSuccess + item.payment_success,
      }),
      { pageView: 0, projectCreated: 0, paymentSuccess: 0 },
    );
  }, [dashboard]);

  return (
    <DashboardLayout userId={userId} mode="admin">
      <section className="space-y-4">
        <article className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,0.1)]">
          <h1 className="text-2xl font-semibold">Admin Analytics</h1>
          <p className="text-sm text-slate-600">Ringkasan metrik harian dan funnel konversi.</p>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <label className="text-sm">Dari<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="ml-2 rounded-xl bg-slate-100 px-3 py-2" /></label>
            <label className="text-sm">Sampai<input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="ml-2 rounded-xl bg-slate-100 px-3 py-2" /></label>
            <button onClick={loadAnalytics} disabled={loading} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">{loading ? 'Memuat...' : 'Refresh'}</button>
          </div>
          {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
        </article>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl bg-white p-4 shadow-[0_3px_12px_rgba(15,23,42,0.1)]"><p className="text-xs text-slate-500">Total Users</p><p className="text-2xl font-semibold">{dashboard?.totalUsers ?? 0}</p></article>
          <article className="rounded-2xl bg-white p-4 shadow-[0_3px_12px_rgba(15,23,42,0.1)]"><p className="text-xs text-slate-500">Page View</p><p className="text-2xl font-semibold">{totals.pageView}</p></article>
          <article className="rounded-2xl bg-white p-4 shadow-[0_3px_12px_rgba(15,23,42,0.1)]"><p className="text-xs text-slate-500">Projects</p><p className="text-2xl font-semibold">{totals.projectCreated}</p></article>
          <article className="rounded-2xl bg-white p-4 shadow-[0_3px_12px_rgba(15,23,42,0.1)]"><p className="text-xs text-slate-500">Payments</p><p className="text-2xl font-semibold">{totals.paymentSuccess}</p></article>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,0.1)]">
            <h2 className="text-lg font-semibold">Funnel</h2>
            <div className="mt-3 space-y-2">
              {(dashboard?.funnel ?? []).map((item) => (
                <div key={item.step} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span>{item.step}</span>
                  <span>{item.users} ({formatPercent(item.conversion_from_prev)})</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,0.1)]">
            <h2 className="text-lg font-semibold">Daily metrics</h2>
            <div className="mt-3 max-h-[420px] overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-white text-slate-500"><tr><th className="py-2 text-left">Date</th><th className="py-2 text-left">PV</th><th className="py-2 text-left">CTA</th><th className="py-2 text-left">Project</th><th className="py-2 text-left">Paid</th></tr></thead>
                <tbody>
                  {(dashboard?.dailyMetrics ?? []).map((item) => (
                    <tr key={item.metric_date} className="border-t border-slate-100"><td className="py-2">{item.metric_date.slice(0, 10)}</td><td>{item.page_view}</td><td>{item.cta_click}</td><td>{item.project_created}</td><td>{item.payment_success}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </section>
    </DashboardLayout>
  );
}
