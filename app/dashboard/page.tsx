'use client';

import { ProjectDashboard } from '@/components/dashboard';

export default function DashboardPage() {
  const userId = 'replace-with-auth-user-id';

  return <ProjectDashboard userId={userId} onUpgradeClick={() => (window.location.href = '/pricing')} />;
}
