import { useState } from 'react';
import { AuthModal } from './AuthModal';

type RedirectTarget = '/dashboard' | '/workspace';

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
          Login
        </button>
        <button type="button" onClick={() => openFor('/workspace')}>
          Start building (CTA)
        </button>
      </div>

      <AuthModal
        isOpen={open}
        onClose={() => setOpen(false)}
        postAuthRedirect={target}
        title={target === '/workspace' ? 'Get started' : 'Welcome back'}
      />
    </>
  );
}
