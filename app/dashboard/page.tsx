'use client';

import { ProjectDashboard } from '@/components/dashboard';
import { useProtectedRoute } from '@/components/auth';

export default function DashboardPage() {
  const { userId, loading, error } = useProtectedRoute('/');

  if (loading) {
    return <p className="material-page p-6 text-sm text-slate-600">Checking authentication...</p>;
  }

  if (error) {
    return <p className="material-page p-6 text-sm text-rose-700">Gagal memuat sesi login: {error}</p>;
  }

  if (!userId) {
    return <p className="material-page p-6 text-sm text-slate-600">Redirecting...</p>;
  }

  return (
    <ProjectDashboard
      userId={userId}
      onUpgradeClick={(projectId) => {
        const params = new URLSearchParams({ source: 'dashboard', reason: 'project_limit' });
        if (projectId) params.set('projectId', projectId);
        window.location.href = `/pricing?${params.toString()}`;
      }}
    />
  );
}
