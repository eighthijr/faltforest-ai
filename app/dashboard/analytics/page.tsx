'use client';

import { AdminAnalyticsDashboard } from '@/components/dashboard';
import { useProtectedRoute } from '@/components/auth';

function isAdminRole(role: string | null): boolean {
  return typeof role === 'string' && role.toLowerCase() === 'admin';
}

export default function DashboardAnalyticsPage() {
  const { userId, role, loading, error } = useProtectedRoute('/');

  if (loading) {
    return <p className="material-page p-6 text-sm text-slate-600">Checking authentication...</p>;
  }

  if (error) {
    return <p className="material-page p-6 text-sm text-rose-700">Gagal memuat sesi login: {error}</p>;
  }

  if (!userId) {
    return <p className="material-page p-6 text-sm text-slate-600">Sedang mengarahkan...</p>;
  }

  if (!isAdminRole(role)) {
    return <main className="px-4 py-10 text-sm text-rose-700">Akses ditolak. Halaman ini khusus admin.</main>;
  }

  return <AdminAnalyticsDashboard userId={userId} />;
}
