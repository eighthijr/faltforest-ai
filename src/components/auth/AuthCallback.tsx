import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export function AuthCallback() {
  useEffect(() => {
    const finalizeAuth = async () => {
      await supabase.auth.getSession();

      const params = new URLSearchParams(window.location.search);
      const next = params.get('next') === '/workspace' ? '/workspace' : '/dashboard';

      window.location.replace(next);
    };

    void finalizeAuth();
  }, []);

  return <p>Completing sign in...</p>;
}
