'use client';

import { PaymentHistoryDashboard } from '@/components/dashboard';
import { useProtectedRoute } from '@/components/auth';

export default function DashboardTransactionsPage() {
  const { userId, loading, error } = useProtectedRoute('/');

  if (loading) {
    return <p className="material-page p-6 text-sm text-slate-600">Checking transaction access...</p>;
  }

  if (error) {
    return <p className="material-page p-6 text-sm text-rose-700">Gagal memuat sesi login: {error}</p>;
  }

  if (!userId) {
    return <p className="material-page p-6 text-sm text-slate-600">Sedang mengarahkan...</p>;
  }

  return <PaymentHistoryDashboard userId={userId} />;
}
