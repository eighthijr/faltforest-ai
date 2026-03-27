'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

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
        className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" />
        <span>{loading ? 'Keluar...' : 'Keluar'}</span>
      </button>
      {error && <p className="mt-1 text-xs text-rose-600">Gagal logout: {error}</p>}
    </div>
  );
}
