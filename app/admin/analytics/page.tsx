'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function rangeToIso(fromDate: string, toDate: string) {
  const from = new Date(`${fromDate}T00:00:00.000Z`).toISOString();
  const to = new Date(`${toDate}T23:59:59.999Z`).toISOString();
  return { from, to };
}

function formatPercent(value: number) {
  return `${Number.isFinite(value) ? value.toFixed(1) : '0.0'}%`;
}

export default function AdminAnalyticsPage() {
  const today = useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = useState(toDateInputValue(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)));
  const [toDate, setToDate] = useState(toDateInputValue(today));

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);

  const loadSession = async () => {
    setChecking(true);
    const response = await fetch('/api/admin/session', { cache: 'no-store' });
    setAuthenticated(response.ok);
    setChecking(false);
  };

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    const { from, to } = rangeToIso(fromDate, toDate);
    const response = await fetch(`/api/admin/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
      cache: 'no-store',
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

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    void loadAnalytics();
  }, [authenticated]);

  const totals = useMemo(() => {
    const metrics = dashboard?.dailyMetrics ?? [];
    return metrics.reduce(
      (acc, item) => {
        acc.pageView += item.page_view;
        acc.ctaClick += item.cta_click;
        acc.loginSuccess += item.login_success;
        acc.projectCreated += item.project_created;
        acc.generationCompleted += item.generation_completed;
        acc.paymentSuccess += item.payment_success;
        return acc;
      },
      {
        pageView: 0,
        ctaClick: 0,
        loginSuccess: 0,
        projectCreated: 0,
        generationCompleted: 0,
        paymentSuccess: 0,
      },
    );
  }, [dashboard]);

  if (checking) {
    return <main className="mx-auto max-w-5xl px-4 py-10 text-sm text-slate-600">Memuat halaman analytics...</main>;
  }

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Session Admin Diperlukan</h1>
          <p className="mt-2 text-sm text-slate-600">Silakan login lewat halaman admin dulu, lalu kembali ke analytics.</p>
          <Link href="/admin" className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Ke Admin Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Analytics</h1>
          <p className="text-sm text-slate-600">Lihat ringkasan metrics harian dan funnel konversi event.</p>
        </div>
        <Link href="/admin" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
          Kembali ke Admin
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-slate-700">
            Dari
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Sampai
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <button onClick={loadAnalytics} disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? 'Memuat...' : 'Refresh Analytics'}
          </button>
        </div>
        {error && <p className="mt-3 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{dashboard?.totalUsers ?? 0}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Page View</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totals.pageView}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Project Created</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totals.projectCreated}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Payment Success</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totals.paymentSuccess}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Funnel</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Step</th>
                  <th className="py-2">Users</th>
                  <th className="py-2">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.funnel ?? []).map((item) => (
                  <tr key={item.step} className="border-t border-slate-100">
                    <td className="py-2 font-medium text-slate-800">{item.step}</td>
                    <td className="py-2 text-slate-700">{item.users}</td>
                    <td className="py-2 text-slate-700">{formatPercent(item.conversion_from_prev)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Daily Metrics</h2>
          <div className="mt-3 max-h-[420px] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-2">Tanggal</th>
                  <th className="py-2 pr-2">PV</th>
                  <th className="py-2 pr-2">CTA</th>
                  <th className="py-2 pr-2">Login</th>
                  <th className="py-2 pr-2">Project</th>
                  <th className="py-2 pr-2">Generate</th>
                  <th className="py-2">Paid</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.dailyMetrics ?? []).map((item) => (
                  <tr key={item.metric_date} className="border-t border-slate-100">
                    <td className="py-2 pr-2 text-slate-800">{item.metric_date.slice(0, 10)}</td>
                    <td className="py-2 pr-2 text-slate-700">{item.page_view}</td>
                    <td className="py-2 pr-2 text-slate-700">{item.cta_click}</td>
                    <td className="py-2 pr-2 text-slate-700">{item.login_success}</td>
                    <td className="py-2 pr-2 text-slate-700">{item.project_created}</td>
                    <td className="py-2 pr-2 text-slate-700">{item.generation_completed}</td>
                    <td className="py-2 text-slate-700">{item.payment_success}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
