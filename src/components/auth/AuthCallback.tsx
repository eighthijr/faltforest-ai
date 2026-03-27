'use client';

import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { isAdminEmail } from '@/lib/admin';

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

  return <p>Completing sign in...</p>;
}
