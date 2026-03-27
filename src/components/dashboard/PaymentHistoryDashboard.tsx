'use client';

import { useEffect, useMemo, useState } from 'react';
import { listPaymentHistory, type PaymentHistoryItem } from '@/api/payments';
import { useToast } from '@/components/ui';
import { DashboardLayout } from './DashboardLayout';

const statusLabelMap: Record<PaymentHistoryItem['status'], string> = {
  pending: 'Pending',
  waiting_confirmation: 'Menunggu Konfirmasi',
  success: 'Berhasil',
  rejected: 'Ditolak',
};

const statusClassMap: Record<PaymentHistoryItem['status'], string> = {
  pending: 'bg-amber-50 text-amber-700',
  waiting_confirmation: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

type PaymentHistoryDashboardProps = {
  userId: string;
};

export function PaymentHistoryDashboard({ userId }: PaymentHistoryDashboardProps) {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { pushToast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await listPaymentHistory();
        setPayments(result);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Gagal memuat histori pembayaran.';
        setError(message);
        pushToast({ type: 'error', title: 'Gagal memuat payment history', description: message });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [pushToast]);

  const successfulPaymentTotal = useMemo(
    () => payments.filter((item) => item.status === 'success').reduce((acc, item) => acc + item.amount, 0),
    [payments],
  );

  return (
    <DashboardLayout userId={userId}>
      <section className="space-y-6">
        <header className="rounded-3xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.08)] md:p-6">
          <p className="text-sm text-slate-500">Dashboard / Payment History</p>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Payment History</h1>
              <p className="mt-2 text-sm text-slate-600">Riwayat pembayaran upgrade project kamu akan muncul di halaman ini.</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              Total pembayaran sukses: <span className="font-semibold text-slate-900">{formatCurrency(successfulPaymentTotal)}</span>
            </div>
          </div>
        </header>

        {loading ? (
          <p className="rounded-2xl bg-white px-4 py-8 text-sm text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.08)]">Memuat payment history...</p>
        ) : error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-[0_1px_2px_rgba(190,24,93,0.14)]">{error}</p>
        ) : payments.length === 0 ? (
          <div className="rounded-2xl bg-white px-4 py-10 text-center shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-slate-700">Belum ada riwayat pembayaran.</p>
            <p className="mt-2 text-sm text-slate-500">Setelah kamu melakukan upgrade, transaksinya akan tampil di sini.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.08)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Project</th>
                    <th className="px-4 py-3 font-semibold">Gateway</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{payment.reference}</td>
                      <td className="whitespace-nowrap px-4 py-3">{payment.project_id}</td>
                      <td className="whitespace-nowrap px-4 py-3">{payment.gateway === 'manual_qris' ? 'Manual QRIS' : 'Tripay QRIS'}</td>
                      <td className="whitespace-nowrap px-4 py-3">{formatCurrency(payment.amount)}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassMap[payment.status]}`}>
                          {statusLabelMap[payment.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{formatDate(payment.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
