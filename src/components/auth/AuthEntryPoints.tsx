'use client';

import { useState } from 'react';
import { AuthModal } from './AuthModal';

type RedirectTarget = '/dashboard' | '/dashboard/workspace';

export function AuthEntryPoints() {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<RedirectTarget>('/dashboard');

  const openFor = (redirectTarget: RedirectTarget) => {
    setTarget(redirectTarget);
    setOpen(true);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="button" onClick={() => openFor('/dashboard')}>
          Masuk
        </button>
        <button type="button" onClick={() => openFor('/dashboard/workspace')}>
          Mulai bikin (CTA)
        </button>
      </div>

      <AuthModal
        isOpen={open}
        onClose={() => setOpen(false)}
        postAuthRedirect={target}
        title={target === '/dashboard/workspace' ? 'Mulai sekarang' : 'Selamat datang kembali'}
      />
    </>
  );
}
