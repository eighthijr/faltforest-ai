'use client';

import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { isAdminEmail } from '@/lib/admin';
import { Spinner } from '@/components/ui';

export function AuthCallback() {
  useEffect(() => {
    const finalizeAuth = async () => {
      const { data } = await supabase.auth.getSession();

      const params = new URLSearchParams(window.location.search);
      const next = params.get('next') === '/workspace' ? '/workspace' : '/dashboard';
      const email = data.session?.user?.email ?? null;
      const destination = isAdminEmail(email) ? '/dashboard' : next;

      window.location.replace(destination);
    };

    void finalizeAuth();
  }, []);

  return (
    <main className="material-page flex min-h-screen items-center justify-center p-6">
      <div className="material-surface flex h-20 w-20 items-center justify-center rounded-full">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    </main>
  );
}
