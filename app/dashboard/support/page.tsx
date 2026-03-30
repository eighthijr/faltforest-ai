'use client';

import { MessageSquareText } from 'lucide-react';
import { useProtectedRoute } from '@/components/auth';
import { DashboardLayout } from '@/components/dashboard';

export default function DashboardSupportPage() {
  const { userId, email, loading, error } = useProtectedRoute('/');

  if (loading) {
    return <p className="material-page p-6 text-sm text-slate-600">Checking support access...</p>;
  }

  if (error || !userId) {
    return <p className="material-page p-6 text-sm text-rose-700">{error ?? 'Session tidak ditemukan.'}</p>;
  }

  const csWhatsappNumber = process.env.NEXT_PUBLIC_CS_WHATSAPP_NUMBER ?? '6281234567890';
  const whatsappLink = `https://wa.me/${csWhatsappNumber}?text=${encodeURIComponent('Halo CS FLATFOREST, saya butuh bantuan.')}`;

  return (
    <DashboardLayout userId={userId} userEmail={email}>
      <section className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-[0_8px_26px_rgba(15,23,42,0.12)]">
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <MessageSquareText className="h-4 w-4" />
          Customer Support
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">Butuh bantuan?</h1>
        <p className="mt-2 text-sm text-slate-600">Hubungi tim CS FLATFOREST via WhatsApp dari dashboard.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            <MessageSquareText className="h-4 w-4" />
            Chat via WhatsApp
          </a>
          <a href="/dashboard" className="inline-flex rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">
            Kembali ke dashboard
          </a>
        </div>
      </section>
    </DashboardLayout>
  );
}
