'use client';

import { FormEvent, useEffect, useState } from 'react';

type ManualPayment = {
  id: string;
  reference: string;
  amount: number;
  status: 'pending' | 'waiting_confirmation' | 'success' | 'rejected';
  gateway: 'manual_qris' | 'tripay_qris';
  created_at: string;
  updated_at: string;
  project_id: string;
  user_id: string;
};

const QRIS_BUCKET_NAME = process.env.NEXT_PUBLIC_QRIS_BUCKET || 'payment-assets';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [busyReference, setBusyReference] = useState<string | null>(null);

  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisImageUrl, setQrisImageUrl] = useState<string>('');
  const [qrisMessage, setQrisMessage] = useState<string | null>(null);

  const loadSession = async () => {
    setChecking(true);

    const response = await fetch('/api/admin/session', { cache: 'no-store' });
    if (response.ok) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }

    setChecking(false);
  };

  const loadPayments = async () => {
    setLoadingPayments(true);
    const response = await fetch('/api/admin/manual-payments', { cache: 'no-store' });
    const data = (await response.json().catch(() => null)) as { payments?: ManualPayment[] } | null;

    if (response.ok) {
      setPayments(data?.payments ?? []);
    }

    setLoadingPayments(false);
  };

  const loadQrisImage = async () => {
    const response = await fetch('/api/admin/qris-image', { cache: 'no-store' });
    const data = (await response.json().catch(() => null)) as { imageUrl?: string } | null;
    if (response.ok && data?.imageUrl) {
      setQrisImageUrl(data.imageUrl);
    }
  };

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    void loadPayments();
    void loadQrisImage();
  }, [authenticated]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setLoginError(data?.message ?? 'Gagal login admin.');
      return;
    }

    setUsername('');
    setPassword('');
    setAuthenticated(true);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setPayments([]);
  };

  const handleDecision = async (reference: string, approve: boolean) => {
    setBusyReference(reference);

    await fetch('/api/admin/manual-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, approve }),
    });

    await loadPayments();
    setBusyReference(null);
  };

  const uploadQrisImage = async () => {
    if (!qrisFile) {
      setQrisMessage('Pilih file gambar dulu.');
      return;
    }

    setQrisMessage('Upload gambar QRIS...');

    const formData = new FormData();
    formData.append('file', qrisFile);

    const response = await fetch('/api/admin/qris-image', {
      method: 'POST',
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as { imageUrl?: string; message?: string } | null;

    if (!response.ok) {
      setQrisMessage(data?.message ?? 'Upload gagal.');
      return;
    }

    setQrisImageUrl(data?.imageUrl ?? qrisImageUrl);
    setQrisFile(null);
    setQrisMessage('Gambar QRIS berhasil diperbarui.');
  };

  if (checking) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-sm text-slate-600">Memuat halaman admin...</main>;
  }

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-md px-4 py-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-600">Masuk untuk mengelola QRIS manual dan verifikasi pembayaran.</p>

          <form className="mt-4 space-y-3" onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">
              Login Admin
            </button>
          </form>

          {loginError && <p className="mt-3 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{loginError}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel Pembayaran</h1>
          <p className="text-sm text-slate-600">Kelola QRIS manual dan approve/reject pembayaran manual user.</p>
        </div>
        <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
          Logout
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Manage Image QRIS</h2>
        <p className="mt-1 text-sm text-slate-600">
          File akan disimpan ke bucket Supabase: {QRIS_BUCKET_NAME}/manual-qris/current.png
        </p>

        {qrisImageUrl && <img src={qrisImageUrl} alt="QRIS manual terbaru" className="mt-4 w-64 rounded-lg border border-slate-200" />}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setQrisFile(event.target.files?.[0] ?? null)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button onClick={uploadQrisImage} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Upload Gambar
          </button>
        </div>

        {qrisMessage && <p className="mt-3 text-sm text-slate-700">{qrisMessage}</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Verifikasi Pembayaran Manual</h2>
          <button onClick={loadPayments} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            Refresh
          </button>
        </div>

        {loadingPayments ? (
          <p className="text-sm text-slate-600">Memuat pembayaran...</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-slate-600">Belum ada pembayaran manual yang perlu diproses.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <article key={payment.id} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600">Reference: <span className="font-mono text-slate-900">{payment.reference}</span></p>
                <p className="text-sm text-slate-600">Project: <span className="font-mono text-slate-900">{payment.project_id}</span></p>
                <p className="text-sm text-slate-600">User: <span className="font-mono text-slate-900">{payment.user_id}</span></p>
                <p className="text-sm text-slate-600">Nominal: <strong>{formatRupiah(payment.amount)}</strong></p>
                <p className="text-sm text-slate-600">Status: <strong>{payment.status}</strong></p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleDecision(payment.reference, true)}
                    disabled={busyReference === payment.reference}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(payment.reference, false)}
                    disabled={busyReference === payment.reference}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
