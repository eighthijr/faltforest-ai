'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type ProtectedRouteState = {
  userId: string | null;
  loading: boolean;
  error: string | null;
};

const DEFAULT_REDIRECT = '/';

export function useProtectedRoute(redirectTo: string = DEFAULT_REDIRECT): ProtectedRouteState {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<ProtectedRouteState>({
    userId: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error) {
        setState({ userId: null, loading: false, error: error.message });
        return;
      }

      const userId = data.user?.id ?? null;

      if (!userId) {
        const params = new URLSearchParams({ from: pathname });
        router.replace(`${redirectTo}?${params.toString()}`);
        setState({ userId: null, loading: false, error: null });
        return;
      }

      setState({ userId, loading: false, error: null });
    };

    void verify();

    return () => {
      mounted = false;
    };
  }, [pathname, redirectTo, router]);

  return state;
}
