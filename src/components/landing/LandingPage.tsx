'use client';

import { useState } from 'react';
import { landingCopy } from './landingCopy.id';
import { AuthModal } from '../auth';

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authRedirectTarget, setAuthRedirectTarget] = useState<'/dashboard' | '/workspace'>('/workspace');

  const openAuth = (target: '/dashboard' | '/workspace') => {
    setAuthRedirectTarget(target);
    setAuthOpen(true);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 text-slate-900 md:px-6 md:py-8">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-base font-bold text-slate-900">Faltforest AI</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => openAuth('/dashboard')}
          >
            Masuk Dashboard
          </button>
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            onClick={() => openAuth('/workspace')}
          >
            Coba Workspace
          </button>
        </div>
      </header>

      <section id="hero" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{landingCopy.hero.badge}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">{landingCopy.hero.title}</h1>
        <p className="mt-3 max-w-3xl text-base text-slate-600 md:text-lg">{landingCopy.hero.subtitle}</p>
        <p className="mt-2 text-sm text-slate-500">
          Mulai dari landing page, lanjut buat project di dashboard, lalu eksekusi di workspace.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-500"
            onClick={() => openAuth('/workspace')}
          >
            {landingCopy.hero.primaryCta}
          </button>
          <a
            href="#demo"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {landingCopy.hero.secondaryCta}
          </a>
        </div>
      </section>

      <section id="problem" className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{landingCopy.problem.title}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          {landingCopy.problem.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section id="solution" className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{landingCopy.solution.title}</h2>
        <p className="mt-3 text-slate-600">{landingCopy.solution.body}</p>
      </section>

      <section id="demo" className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{landingCopy.demo.title}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-600">
          {landingCopy.demo.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <button
          type="button"
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-500"
          onClick={() => openAuth('/workspace')}
        >
          {landingCopy.demo.cta}
        </button>
      </section>

      <section id="benefits" className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{landingCopy.benefits.title}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {landingCopy.benefits.items.map((item) => (
            <article key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="proof" className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{landingCopy.proof.title}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {landingCopy.proof.stats.map((stat) => (
            <article key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <strong className="text-2xl text-slate-900">{stat.value}</strong>
              <p className="mt-1 text-slate-600">{stat.label}</p>
            </article>
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          {landingCopy.proof.quotes.map((quote) => (
            <blockquote key={quote} className="rounded-xl border-l-4 border-indigo-600 bg-indigo-50 p-4 text-slate-700">
              {quote}
            </blockquote>
          ))}
        </div>
      </section>

      <section id="cta" className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-indigo-900">{landingCopy.cta.title}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-indigo-900/80">{landingCopy.cta.body}</p>
        <button
          type="button"
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-500"
          onClick={() => openAuth('/workspace')}
        >
          {landingCopy.cta.button}
        </button>
        <p className="mt-2 text-xs text-indigo-900/70">{landingCopy.cta.note}</p>
      </section>

      <footer id="footer" className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{landingCopy.footer.text}</p>
        <nav aria-label="Footer" className="mt-3">
          <ul className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
            {landingCopy.footer.links.map((link) => (
              <li key={link}>
                <a href="#hero" className="hover:text-indigo-700 hover:underline">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </footer>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        postAuthRedirect={authRedirectTarget}
        title={authRedirectTarget === '/workspace' ? 'Mulai gratis sekarang' : 'Selamat datang kembali'}
      />
    </main>
  );
}
