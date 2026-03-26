'use client';

import { useEffect, useState } from 'react';
import { ProjectDashboard } from '@/components/dashboard';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        setAuthError(error.message);
        return;
      }

      const authUserId = data.user?.id;

      if (!authUserId) {
        window.location.replace('/');
        return;
      }

      setUserId(authUserId);
    };

    void loadUser();
  }, []);

  if (authError) {
    return <p className="material-page p-4 text-sm text-rose-700">Gagal memuat sesi login: {authError}</p>;
  }

  if (!userId) {
    return <p className="material-page p-4 text-sm text-slate-600">Memuat dashboard...</p>;
  }

  return (
    <ProjectDashboard
      userId={userId}
      onUpgradeClick={(projectId) => {
        const params = new URLSearchParams({
          source: 'dashboard',
          reason: 'project_limit',
        });

        if (projectId) params.set('projectId', projectId);
        window.location.href = `/pricing?${params.toString()}`;
      }}
    />
  );
}
