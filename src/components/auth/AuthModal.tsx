'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { isAdminEmail } from '@/lib/admin';
import { buildRedirectTo } from './useRedirectTo';
import { Spinner } from '../ui';

type AuthMode = 'login' | 'signup';

function EyeIcon({ closed = false }: { closed?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
      {closed ? <path d="m4 4 16 16" /> : null}
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9a6 6 0 1 1 0-12c2.2 0 3.7.9 4.5 1.7l3-2.9C17.6 2.9 15 2 12 2a10 10 0 1 0 0 20c5.8 0 9.7-4.1 9.7-9.8 0-.7-.1-1.3-.2-2H12Z" />
      <path fill="#34A853" d="M3.6 7.3 6.8 9.6A6 6 0 0 1 12 6c2.2 0 3.7.9 4.5 1.7l3-2.9C17.6 2.9 15 2 12 2a10 10 0 0 0-8.4 5.3Z" />
      <path fill="#FBBC05" d="M12 22a10 10 0 0 0 6.8-2.5l-3.1-2.6c-.9.6-2.1 1.1-3.7 1.1-3.8 0-5.1-2.6-5.4-3.9l-3.2 2.5A10 10 0 0 0 12 22Z" />
      <path fill="#4285F4" d="M21.7 12.2c0-.7-.1-1.3-.2-2H12v3.9h5.4c-.3 1.1-1 2-1.7 2.7l3.1 2.6c1.8-1.7 2.9-4.1 2.9-7.2Z" />
    </svg>
  );
}

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  postAuthRedirect: '/dashboard' | '/dashboard/workspace';
  title?: string;
};

export function AuthModal({
  isOpen,
  onClose,
  postAuthRedirect,
  title = 'Masuk ke akun kamu',
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [closing, setClosing] = useState(false);
  const [redirectingTo, setRedirectingTo] = useState<'/dashboard' | '/dashboard/workspace' | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const redirectTo = useMemo(() => buildRedirectTo(postAuthRedirect), [postAuthRedirect]);

  useEffect(() => {
    if (!isOpen) return;
    setClosing(false);
    setRedirectingTo(null);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = modalRef.current?.querySelector<HTMLElement>('button, input, a, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const clearFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const handleGoogleOAuth = async () => {
    clearFeedback();
    setLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);

    if (mode === 'login') {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
      } else {
        const destination = isAdminEmail(data.user?.email ?? email) ? '/dashboard' : postAuthRedirect;
        setRedirectingTo(destination);
        window.location.assign(destination);
      }

      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage('Akun berhasil dibuat. Cek email kamu untuk konfirmasi.');
    }

    setLoading(false);
  };

  const handleClose = () => {
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      onClose();
    }, 180);
  };

  return (
    <div
      className={`fixed inset-0 z-[999] grid place-items-center bg-slate-900/55 p-4 backdrop-blur-[2px] transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Modal autentikasi"
    >
      {redirectingTo ? (
        <div className="flex w-full max-w-sm flex-col items-center rounded-2xl bg-white p-6 text-center shadow-2xl">
          <Spinner size="md" className="text-indigo-600" />
          <p className="mt-3 text-sm font-semibold text-slate-800">Sedang mengarahkan...</p>
          <p className="text-xs text-slate-500">{redirectingTo === '/dashboard' ? 'Membuka dashboard kamu.' : 'Membuka workspace kamu.'}</p>
        </div>
      ) : (
      <div
        ref={modalRef}
        className={`animate-modal-in relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl transition-transform duration-200 ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <button
          className="absolute right-3 top-3 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          onClick={handleClose}
          type="button"
          aria-label="Tutup modal autentikasi"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">Lanjutkan dengan Google atau pakai email dan password.</p>

        <button
          type="button"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          onClick={handleGoogleOAuth}
          disabled={loading}
        >
          {loading ? <Spinner className="text-white" /> : <GoogleIcon />}
          Lanjutkan dengan Google
        </button>

        <div className="my-3 text-center text-sm text-slate-500">atau</div>

        <form onSubmit={handleEmailAuth} className="grid gap-2">
          <label htmlFor="auth-email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          />

          <label htmlFor="auth-password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 inline-flex items-center text-slate-500 hover:text-slate-700"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              <EyeIcon closed={showPassword} />
            </button>
          </div>

          <button
            type="submit"
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? <Spinner className="text-white" /> : null}
            {mode === 'login' ? 'Masuk' : 'Buat akun'}
          </button>
        </form>

        <div className="mt-3 flex items-center gap-1 text-sm text-slate-600">
          {mode === 'login' ? (
            <>
              <span>Belum punya akun?</span>
              <button type="button" onClick={() => setMode('signup')} className="font-semibold text-indigo-700 hover:underline">
                Daftar
              </button>
            </>
          ) : (
            <>
              <span>Sudah punya akun?</span>
              <button type="button" onClick={() => setMode('login')} className="font-semibold text-indigo-700 hover:underline">
                Masuk
              </button>
            </>
          )}
        </div>

        {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
      </div>
      )}
    </div>
  );
}
