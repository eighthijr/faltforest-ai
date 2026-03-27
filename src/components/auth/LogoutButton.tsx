'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { IconLogout } from '@/components/dashboard/icons';

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      setLoading(false);
      return;
    }

    window.location.replace('/');
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <IconLogout className="h-4 w-4" />
        <span>{loading ? 'Keluar...' : 'Keluar'}</span>
      </button>
      {error && <p className="mt-1 text-xs text-rose-600">Gagal logout: {error}</p>}
    </div>
  );
}
