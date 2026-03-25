'use client';

import { FormEvent, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { buildRedirectTo } from './useRedirectTo';
import '../../styles/auth-modal.css';

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
  title = 'Welcome',
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = useMemo(
    () => buildRedirectTo(postAuthRedirect),
    [postAuthRedirect],
  );

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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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
      setMessage('Account created. Check your inbox to confirm your email.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-modal-backdrop" role="dialog" aria-modal="true" aria-label="Authentication Modal">
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose} type="button" aria-label="Close authentication modal">
          ×
        </button>

        <h2>{title}</h2>
        <p className="auth-subtitle">Continue with Google or use your email and password.</p>

        <button type="button" className="auth-google-btn" onClick={handleGoogleOAuth} disabled={loading}>
          Continue with Google
        </button>

        <div className="auth-divider">or</div>

        <form onSubmit={handleEmailAuth} className="auth-form">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch-row">
          {mode === 'login' ? (
            <>
              <span>Don&apos;t have an account?</span>
              <button type="button" onClick={() => setMode('signup')} className="auth-link-btn">
                Sign up
              </button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>
              <button type="button" onClick={() => setMode('login')} className="auth-link-btn">
                Login
              </button>
            </>
          )}
        </div>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}
      </div>
    </div>
  );
}
