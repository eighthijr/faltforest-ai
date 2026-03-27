'use client';

import { FormEvent, useEffect, useState } from 'react';
import { BadgeCheck, ImagePlus, RefreshCcw } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard';

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
  proof_path: string | null;
};

const QRIS_BUCKET_NAME = process.env.NEXT_PUBLIC_QRIS_BUCKET || 'payment-assets';
const SUPABASE_PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

function buildProofUrl(path: string | null) {
  if (!path || !SUPABASE_PUBLIC_URL) return null;
  return `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${QRIS_BUCKET_NAME}/${path}`;
}

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
  const [qrisImageUrl, setQrisImageUrl] = useState('');
  const [qrisMessage, setQrisMessage] = useState<string | null>(null);

  const loadSession = async () => {
    setChecking(true);
    const response = await fetch('/api/admin/session', { cache: 'no-store' });
    setAuthenticated(response.ok);
    setChecking(false);
  };

  const loadPayments = async () => {
    setLoadingPayments(true);
    const response = await fetch('/api/admin/manual-payments', { cache: 'no-store' });
    const data = (await response.json().catch(() => null)) as { payments?: ManualPayment[] } | null;
    if (response.ok) setPayments(data?.payments ?? []);
    setLoadingPayments(false);
  };

  const loadQrisImage = async () => {
    const response = await fetch('/api/admin/qris-image', { cache: 'no-store' });
    const data = (await response.json().catch(() => null)) as { imageUrl?: string } | null;
    if (response.ok && data?.imageUrl) setQrisImageUrl(data.imageUrl);
  };

  useEffect(() => { void loadSession(); }, []);
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
    const response = await fetch('/api/admin/qris-image', { method: 'POST', body: formData });
    const data = (await response.json().catch(() => null)) as { imageUrl?: string; message?: string } | null;
    if (!response.ok) {
      setQrisMessage(data?.message ?? 'Upload gagal.');
      return;
    }
    setQrisImageUrl(data?.imageUrl ?? qrisImageUrl);
    setQrisFile(null);
    setQrisMessage('Gambar QRIS berhasil diperbarui.');
  };

  if (checking) return <main className="px-4 py-10 text-sm text-slate-600">Memuat halaman admin...</main>;

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <section className="w-full rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,0.1)]">
          <h1 className="text-xl font-semibold text-slate-900">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-600">Masuk untuk mengelola pembayaran manual dan QRIS.</p>
          <form className="mt-4 space-y-3" onSubmit={handleLogin}>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full rounded-xl bg-slate-100 px-3 py-2" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl bg-slate-100 px-3 py-2" />
            <button type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white">Login Admin</button>
          </form>
          {loginError && <p className="mt-3 text-sm text-rose-700">{loginError}</p>}
        </section>
      </main>
    );
  }

  return (
    <DashboardLayout userId="admin" mode="admin">
      <section className="space-y-4">
        <article className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,0.1)]">
          <h1 className="text-2xl font-semibold">Admin Panel Pembayaran</h1>
          <p className="text-sm text-slate-600">Kelola verifikasi pembayaran dan aset QRIS.</p>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,0.1)]">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold"><ImagePlus className="h-5 w-5" />Manage QRIS image</h2>
          {qrisImageUrl && <img src={qrisImageUrl} alt="QRIS manual terbaru" className="mt-4 w-64 rounded-xl" />}
          <div className="mt-4 flex flex-wrap gap-2">
            <input type="file" accept="image/*" onChange={(e) => setQrisFile(e.target.files?.[0] ?? null)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm" />
            <button onClick={uploadQrisImage} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Upload</button>
          </div>
          {qrisMessage && <p className="mt-2 text-sm text-slate-600">{qrisMessage}</p>}
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,0.1)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Manual payment verification</h2>
            <button onClick={loadPayments} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"><RefreshCcw className="h-4 w-4" />Refresh</button>
          </div>

          {loadingPayments ? (
            <p className="text-sm text-slate-600">Memuat pembayaran...</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-slate-600">Belum ada pembayaran manual yang perlu diproses.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => {
                const proofUrl = buildProofUrl(payment.proof_path);
                return (
                  <article key={payment.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Reference</p>
                    <p className="font-mono text-sm text-slate-900">{payment.reference}</p>
                    <p className="mt-2 text-sm text-slate-700">Nominal: <strong>{formatRupiah(payment.amount)}</strong></p>
                    <p className="text-sm text-slate-700">Status: <strong>{payment.status}</strong></p>
                    {proofUrl && <a href={proofUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-indigo-700">Lihat bukti transfer</a>}
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleDecision(payment.reference, true)} disabled={busyReference === payment.reference} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><BadgeCheck className="h-4 w-4" />Approve</button>
                      <button onClick={() => handleDecision(payment.reference, false)} disabled={busyReference === payment.reference} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Reject</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </article>
      </section>
    </DashboardLayout>
  );
}
