'use client';

import { useState } from 'react';
import { ArrowRight, Bot, CheckCircle2, Clock3, LayoutTemplate, MessageSquareText, Sparkles, Zap } from 'lucide-react';
import { pricingPlans } from '@/lib/pricing';
import { landingCopy } from './landingCopy.id';
import { AuthModal } from '../auth';

const cardClass = 'rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,0.1)] md:p-8';

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authRedirectTarget, setAuthRedirectTarget] = useState<'/dashboard' | '/dashboard/workspace'>('/dashboard/workspace');

  const openAuth = (target: '/dashboard' | '/dashboard/workspace') => {
    setAuthRedirectTarget(target);
    setAuthOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-100 pb-8 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white px-4 py-3 shadow-[0_4px_16px_rgba(15,23,42,0.1)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700"><Sparkles className="h-5 w-5" /></span>
            <p className="text-base font-bold tracking-tight">{landingCopy.navbar.logo}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700" onClick={() => openAuth('/dashboard')}>
              {landingCopy.navbar.login}
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => openAuth('/dashboard/workspace')}>
              {landingCopy.navbar.cta}<ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className={`${cardClass}`}>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"><Clock3 className="h-4 w-4" /> Luncurkan lebih cepat minggu ini</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">{landingCopy.hero.title}</h1>
              <p className="mt-4 text-base text-slate-600 md:text-lg">{landingCopy.hero.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button type="button" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white" onClick={() => openAuth('/dashboard/workspace')}>
                  {landingCopy.hero.primaryCta}
                </button>
                <button type="button" className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700" onClick={() => openAuth('/dashboard')}>
                  Lihat dashboard dulu
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-500">{landingCopy.hero.microTrust} · Slot proyek gratis masih tersedia hari ini.</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.28)]">
              <p className="text-sm font-semibold text-slate-800">Pratinjau produk langsung</p>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700"><MessageSquareText className="h-4 w-4 text-indigo-600" /> Chat AI Ruang Kerja</p>
                  <p className="mt-1 text-xs text-slate-500">Prompt terarah, indikator mengetik, dan aksi pratinjau.</p>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700"><LayoutTemplate className="h-4 w-4 text-indigo-600" /> Hasil Landing Page</p>
                  <p className="mt-1 text-xs text-slate-500">Bagian hero, manfaat, bukti sosial, dan ajakan aksi dibuat otomatis.</p>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700"><Zap className="h-4 w-4 text-indigo-600" /> Fokus konversi</p>
                  <p className="mt-1 text-xs text-slate-500">Penawaran jelas, sense of urgency, dan ajakan aksi yang tegas.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`mt-6 ${cardClass}`}>
          <h2 className="text-2xl font-bold">Kenapa tim memilih FLATFOREST</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {landingCopy.solution.points.map((point) => (
              <article key={point} className="rounded-2xl bg-slate-50 p-4">
                <p className="inline-flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 text-indigo-600" />{point}</p>
              </article>
            ))}
          </div>
        </section>



        <section className={`mt-6 ${cardClass}`} id="pricing">
          <h2 className="text-2xl font-bold">Harga</h2>
          <p className="mt-2 text-sm text-slate-600">Mulai dari gratis, upgrade saat butuh download tanpa batas dan revisi lanjutan.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <article
                key={plan.id}
                className={`relative rounded-2xl p-4 ${
                  plan.recommended ? 'border-2 border-indigo-300 bg-indigo-50' : 'border border-slate-200 bg-slate-50'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-2 right-3 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Rekomendasi
                  </span>
                )}
                <h3 className="text-base font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{plan.priceLabel}</p>
                <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={`mt-6 ${cardClass}`} id="how-it-works">
          <h2 className="text-2xl font-bold">Cara kerja</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {landingCopy.howItWorks.steps.map((step, index) => (
              <article key={step.title} className="rounded-2xl bg-slate-50 p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">{index + 1}</span>
                <p className="mt-3 font-semibold">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-indigo-600 p-8 text-center text-white shadow-[0_12px_32px_rgba(79,70,229,0.38)]">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold"><Bot className="h-4 w-4" />AI workspace ready</p>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">{landingCopy.cta.title}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-indigo-100 md:text-base">{landingCopy.cta.body}</p>
          <button type="button" className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700" onClick={() => openAuth('/dashboard/workspace')}>
            {landingCopy.cta.button}
          </button>
          <p className="mt-2 text-xs text-indigo-100">{landingCopy.cta.note}</p>
        </section>
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        postAuthRedirect={authRedirectTarget}
        title={authRedirectTarget === '/dashboard/workspace' ? 'Mulai gratis sekarang' : 'Selamat datang kembali'}
      />
    </main>
  );
}
