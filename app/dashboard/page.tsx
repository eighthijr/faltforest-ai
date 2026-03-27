'use client';

import { AdminPaymentsDashboard, ProjectDashboard } from '@/components/dashboard';
import { useProtectedRoute } from '@/components/auth';

function isAdminRole(role: string | null): boolean {
  return typeof role === 'string' && role.toLowerCase() === 'admin';
}

export default function DashboardPage() {
  const { userId, email, role, loading, error } = useProtectedRoute('/');

  if (loading) {
    return <p className="material-page p-6 text-sm text-slate-600">Checking authentication...</p>;
  }

  if (error) {
    return <p className="material-page p-6 text-sm text-rose-700">Gagal memuat sesi login: {error}</p>;
  }

  if (!userId) {
    return <p className="material-page p-6 text-sm text-slate-600">Redirecting...</p>;
  }

  if (isAdminRole(role)) {
    return <AdminPaymentsDashboard userId={userId} userEmail={email} />;
  }

  return (
    <ProjectDashboard
      userId={userId}
      userEmail={email}
      onUpgradeClick={(projectId) => {
        const params = new URLSearchParams({ source: 'dashboard', reason: 'project_limit' });
        if (projectId) params.set('projectId', projectId);
        window.location.href = `/pricing?${params.toString()}`;
      }}
    />
  );
}
