'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { buildRedirectTo } from './useRedirectTo';

type AuthMode = 'login' | 'signup';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  postAuthRedirect: '/dashboard' | '/workspace';
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
  const modalRef = useRef<HTMLDivElement>(null);

  const redirectTo = useMemo(() => buildRedirectTo(postAuthRedirect), [postAuthRedirect]);

  useEffect(() => {
    if (!isOpen) return;

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
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
      } else {
        window.location.assign(postAuthRedirect);
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

  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label="Modal autentikasi">
      <div ref={modalRef} className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <button
          className="absolute right-3 top-3 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          onClick={onClose}
          type="button"
          aria-label="Tutup modal autentikasi"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">Lanjutkan dengan Google atau pakai email dan password.</p>

        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          onClick={handleGoogleOAuth}
          disabled={loading}
        >
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
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          />

          <button
            type="submit"
            className="mt-1 w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
            disabled={loading}
          >
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
    </div>
  );
}
