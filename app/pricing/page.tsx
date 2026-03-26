'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { listProjects } from '@/api/projects';
import { supabase } from '@/lib/supabaseClient';
import type { Project } from '@/types/project';
import { Spinner, useToast } from '@/components/ui';

const PREMIUM_PRICE = 99000;
const QRIS_BUCKET_NAME = process.env.NEXT_PUBLIC_QRIS_BUCKET || 'payment-assets';
const MANUAL_QRIS_IMAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${QRIS_BUCKET_NAME}/manual-qris/current.png`
  : '';

const reasonLabel: Record<string, string> = {
  download: 'Fitur download file HTML',
  chat_after_generated: 'Lanjut chat setelah landing page selesai',
  project_limit: 'Kuota 1 project untuk paket FREE',
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function PricingPageContent() {
  const { pushToast } = useToast();
  const searchParams = useSearchParams();
  const source = searchParams.get('source') ?? 'app';
  const reason = searchParams.get('reason') ?? 'project_limit';
  const queryProjectId = searchParams.get('projectId');

  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(queryProjectId);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'tripay' | 'manual'>('tripay');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const requirement = reasonLabel[reason] ?? 'Akses fitur PREMIUM';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const authUserId = data.user?.id;
      if (!authUserId) {
        window.location.replace('/');
        return;
      }

      setUserId(authUserId);

      try {
        const list = await listProjects(authUserId);
        setProjects(list);
        if (!selectedProjectId) {
          setSelectedProjectId(list[0]?.id ?? null);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data project.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [queryProjectId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  useEffect(() => {
    if (!userId || !selectedProjectId || success) return;

    const timer = window.setInterval(async () => {
      try {
        const refreshed = await listProjects(userId);
        setProjects(refreshed);
        const updated = refreshed.find((project) => project.id === selectedProjectId);
        if (updated?.type === 'premium') {
          setSuccess(true);
        }
      } catch {
        // polling best effort
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [userId, selectedProjectId, success]);

  useEffect(() => {
    return () => {
      if (proofPreviewUrl) {
        URL.revokeObjectURL(proofPreviewUrl);
      }
    };
  }, [proofPreviewUrl]);

  const startCheckout = async () => {
    if (!selectedProject) {
      setError('Project belum dipilih.');
      return;
    }

    setCheckoutLoading(true);
    setError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw new Error(sessionError.message);
      if (!session?.access_token) throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');

      const merchantRef = `UPG-${Date.now()}-${selectedProject.id.slice(0, 6)}`;
      const response = await fetch('/api/payments/tripay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          reference: merchantRef,
          amount: PREMIUM_PRICE,
        }),
      });

      const data = (await response.json().catch(() => null)) as { checkoutUrl?: string; message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message ?? 'Gagal membuat transaksi pembayaran.');
      }

      if (!data?.checkoutUrl) throw new Error('Link checkout belum tersedia dari Tripay.');

      setReference(merchantRef);
      setCheckoutUrl(data.checkoutUrl);
      window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
      pushToast({ type: 'success', title: 'Checkout dibuat', description: 'Lanjutkan pembayaran di tab baru.' });
    } catch (checkoutError) {
      const message = checkoutError instanceof Error ? checkoutError.message : 'Checkout gagal diproses.';
      setError(message);
      pushToast({ type: 'error', title: 'Checkout gagal', description: message });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const submitManualProof = async () => {
    if (!selectedProject) {
      setError('Project belum dipilih.');
      return;
    }

    if (!proofFile) {
      setError('Upload bukti transfer dulu sebelum kirim verifikasi.');
      return;
    }

    setManualLoading(true);
    setError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw new Error(sessionError.message);
      if (!session?.access_token) throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');

      const formData = new FormData();
      formData.append('projectId', selectedProject.id);
      formData.append('file', proofFile);

      const response = await fetch('/api/payments/manual/submit-proof', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = (await response.json().catch(() => null)) as { message?: string; reference?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message ?? 'Gagal kirim bukti transfer QRIS manual.');
      }

      setReference(data?.reference ?? null);
      setProofFile(null);
      setProofPreviewUrl(null);
      pushToast({ type: 'success', title: 'Bukti transfer terkirim', description: 'Status pembayaran menunggu verifikasi admin.' });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Kirim bukti transfer gagal diproses.';
      setError(message);
      pushToast({ type: 'error', title: 'Upload bukti gagal', description: message });
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Upgrade Premium</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Buka semua fitur tanpa batasan paywall</h1>
        <p className="mt-3 text-sm text-slate-600">
          Kamu diarahkan dari <strong>{source}</strong> karena butuh akses ke: <strong>{requirement}</strong>.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Paket FREE</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Maksimal 1 project</li>
              <li>• Bisa generate landing page</li>
              <li>• Download & lanjutan chat dikunci paywall</li>
            </ul>
          </article>

          <article className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <h2 className="text-lg font-semibold text-indigo-900">Paket PREMIUM</h2>
            <ul className="mt-3 space-y-2 text-sm text-indigo-900">
              <li>• Project lebih dari 1</li>
              <li>• Download file HTML tanpa batas</li>
              <li>• Lanjut revisi/chat setelah generate</li>
            </ul>
          </article>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Harga upgrade: <strong>{formatRupiah(PREMIUM_PRICE)}</strong> (sekali bayar per project).
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-600">Memuat data akun...</p>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700" htmlFor="project-select">
              Pilih project yang mau di-upgrade
            </label>
            <select
              id="project-select"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={selectedProjectId ?? ''}
              onChange={(event) => setSelectedProjectId(event.target.value || null)}
            >
              <option value="" disabled>
                Pilih project...
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.id} • {project.type.toUpperCase()} • {project.status}
                </option>
              ))}
            </select>

            <div className="grid gap-2 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('tripay')}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                  paymentMethod === 'tripay'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                QRIS Otomatis (Tripay)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('manual')}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                  paymentMethod === 'manual'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                QRIS Manual
              </button>
            </div>

            {paymentMethod === 'tripay' ? (
              <button
                type="button"
                onClick={startCheckout}
                disabled={checkoutLoading || !selectedProject}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                {checkoutLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="text-white" />
                    Membuat checkout...
                  </span>
                ) : (
                  'Bayar Sekarang via QRIS Tripay'
                )}
              </button>
            ) : (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  1) Scan QRIS manual, 2) upload bukti transfer, 3) sistem otomatis kirim untuk verifikasi admin.
                </p>
                {MANUAL_QRIS_IMAGE_URL ? (
                  <Image
                    src={MANUAL_QRIS_IMAGE_URL}
                    alt="QRIS Manual Faltforest AI"
                    width={280}
                    height={280}
                    className="rounded-lg border border-slate-200"
                  />
                ) : (
                  <p className="text-xs text-amber-700">
                    QRIS manual belum tersedia. Upload dulu ke Supabase Storage bucket <code>{QRIS_BUCKET_NAME}</code> dengan path{' '}
                    <code>manual-qris/current.png</code>.
                  </p>
                )}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="proof-upload">
                    Upload bukti transfer
                  </label>
                  <input
                    id="proof-upload"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setProofFile(file);
                      if (proofPreviewUrl) {
                        URL.revokeObjectURL(proofPreviewUrl);
                      }
                      setProofPreviewUrl(file ? URL.createObjectURL(file) : null);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  {proofPreviewUrl && (
                    <Image
                      src={proofPreviewUrl}
                      alt="Preview bukti transfer"
                      width={280}
                      height={280}
                      className="rounded-lg border border-slate-200 object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={submitManualProof}
                    disabled={manualLoading || !selectedProject || !proofFile}
                    className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
                  >
                    {manualLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="text-white" />
                        Mengunggah bukti...
                      </span>
                    ) : (
                      'Upload Bukti & Kirim Verifikasi'
                    )}
                  </button>
                </div>
                {reference && (
                  <p className="text-xs text-slate-600">
                    Reference manual: <span className="font-mono">{reference}</span>. Bukti transfer terkirim dan status sekarang menunggu
                    verifikasi admin.
                  </p>
                )}
              </div>
            )}

            {checkoutUrl && (
              <p className="text-sm text-slate-600">
                Checkout sudah dibuka di tab baru. Kalau belum terbuka, klik{' '}
                <a href={checkoutUrl} target="_blank" rel="noreferrer" className="font-semibold text-indigo-700 hover:underline">
                  link pembayaran ini
                </a>
                .
              </p>
            )}

            {reference && !success && (
              <p className="text-xs text-slate-500">
                Menunggu konfirmasi pembayaran untuk reference <span className="font-mono">{reference}</span>.
                Halaman ini auto-check status setiap 5 detik.
              </p>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Pembayaran terkonfirmasi. Project kamu sudah PREMIUM ✅
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
            Kembali ke Dashboard
          </Link>
          <Link
            href={selectedProjectId ? `/workspace?projectId=${selectedProjectId}` : '/workspace'}
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
          >
            Kembali ke Workspace
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<main className="mx-auto w-full max-w-4xl px-4 py-10 text-sm text-slate-600">Memuat halaman pricing...</main>}>
      <PricingPageContent />
    </Suspense>
  );
}
