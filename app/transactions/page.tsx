'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Spinner } from '@/components/ui';

type PaymentHistoryItem = {
  id: string;
  project_id: string;
  reference: string;
  amount: number;
  gateway: 'manual_qris' | 'tripay_qris';
  status: 'pending' | 'waiting_confirmation' | 'success' | 'rejected';
  created_at: string;
  confirmed_at: string | null;
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function badgeClasses(status: PaymentHistoryItem['status']) {
  if (status === 'success') return 'bg-emerald-100 text-emerald-700';
  if (status === 'waiting_confirmation') return 'bg-amber-100 text-amber-700';
  if (status === 'rejected') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
}

export default function TransactionsPage() {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        window.location.replace('/');
        return;
      }

      const response = await fetch('/api/payments/history', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = (await response.json().catch(() => null)) as { payments?: PaymentHistoryItem[]; message?: string } | null;

      if (!response.ok) {
        setError(data?.message ?? 'Gagal memuat riwayat transaksi.');
        setLoading(false);
        return;
      }

      setPayments(data?.payments ?? []);
      setLoading(false);
    };

    void load();
  }, []);

  const stats = useMemo(() => {
    const waiting = payments.filter((payment) => payment.status === 'waiting_confirmation').length;
    const success = payments.filter((payment) => payment.status === 'success').length;
    return { total: payments.length, waiting, success };
  }, [payments]);

  return (
    <main className="material-page mx-auto w-full max-w-5xl space-y-4 px-4 py-10">
      <section className="material-surface p-6">
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Transaksi</h1>
        <p className="mt-2 text-sm text-slate-600">Pantau status pembayaran premium per project secara real-time.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">Total</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{stats.total}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">Menunggu</p>
            <p className="mt-1 text-xl font-bold text-amber-700">{stats.waiting}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">Berhasil</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">{stats.success}</p>
          </article>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/pricing" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.35)]">
            Upgrade Project
          </Link>
          <Link href="/dashboard" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Kembali ke Dashboard
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="flex items-center gap-2 px-4 py-6 text-sm text-slate-600">
            <Spinner /> Memuat riwayat transaksi...
          </p>
        ) : error ? (
          <p className="px-4 py-6 text-sm text-rose-700">{error}</p>
        ) : payments.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-600">Belum ada transaksi. Kamu bisa mulai upgrade dari halaman pricing.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Metode</th>
                  <th className="px-4 py-3 font-semibold">Nominal</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{payment.reference}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{payment.project_id}</td>
                    <td className="px-4 py-3 text-slate-700">{payment.gateway === 'tripay_qris' ? 'QRIS Tripay' : 'QRIS Manual'}</td>
                    <td className="px-4 py-3 text-slate-700">{formatRupiah(payment.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClasses(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(payment.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
