'use client';

import { AdminPaymentsDashboard, ProjectDashboard } from '@/components/dashboard';
import { useProtectedRoute } from '@/components/auth';
import { Spinner } from '@/components/ui';

function isAdminRole(role: string | null): boolean {
  return typeof role === 'string' && role.toLowerCase() === 'admin';
}

export default function DashboardPage() {
  const { userId, email, role, loading, error } = useProtectedRoute('/');

  if (loading) {
    return (
      <main className="material-page flex min-h-screen items-center justify-center p-6">
        <div className="material-surface flex h-20 w-20 items-center justify-center rounded-full">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      </main>
    );
  }

  if (error) {
    return <p className="material-page p-6 text-sm text-rose-700">Gagal memuat sesi login: {error}</p>;
  }

  if (!userId) {
    return <p className="material-page p-6 text-sm text-slate-600">Sedang mengarahkan...</p>;
  }

  if (isAdminRole(role)) {
    return <AdminPaymentsDashboard userId={userId} userEmail={email} />;
  }

  return (
    <ProjectDashboard
      userId={userId}
      userEmail={email}
      onUpgradeClick={(projectId) => {
        if (projectId) {
          window.location.href = `/dashboard/workspace?projectId=${projectId}`;
          return;
        }

        window.location.href = '/dashboard/workspace';
      }}
    />
  );
}
