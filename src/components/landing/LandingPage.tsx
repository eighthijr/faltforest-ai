'use client';

import { useState } from 'react';
import { landingCopy } from './landingCopy.id';
import { AuthModal } from '../auth';

const sectionCardClass =
  'rounded-[28px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.07),0_10px_24px_rgba(99,102,241,0.08)] backdrop-blur md:p-8';

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authRedirectTarget, setAuthRedirectTarget] = useState<'/dashboard' | '/workspace'>('/workspace');

  const openAuth = (target: '/dashboard' | '/workspace') => {
    setAuthRedirectTarget(target);
    setAuthOpen(true);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0e7ff_0%,_#f8fafc_35%,_#f8fafc_100%)] pb-8 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 pt-4 md:px-6 md:pt-6">
        <header className="sticky top-3 z-20 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-[0_6px_20px_rgba(15,23,42,0.08)] backdrop-blur md:px-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">✦</span>
            <p className="text-base font-bold tracking-tight text-slate-900">{landingCopy.navbar.logo}</p>
          </div>

          <nav aria-label="Main menu" className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
            {landingCopy.navbar.menu.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
            <button
              id="login"
              type="button"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              onClick={() => openAuth('/dashboard')}
            >
              {landingCopy.navbar.login}
            </button>
            <button
              type="button"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.4)] transition hover:bg-indigo-500"
              onClick={() => openAuth('/workspace')}
            >
              {landingCopy.navbar.cta}
            </button>
          </nav>
        </header>

        <section id="hero" className={`${sectionCardClass} overflow-hidden`}>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Bikin landing page lebih niat, tanpa ribet
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">{landingCopy.hero.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">{landingCopy.hero.subtitle}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(79,70,229,0.4)] transition hover:bg-indigo-500"
                  onClick={() => openAuth('/workspace')}
                >
                  {landingCopy.hero.primaryCta}
                </button>
                <a
                  href="#demo"
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {landingCopy.demo.cta}
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-500">{landingCopy.hero.microTrust}</p>
            </div>

            <aside className="rounded-[24px] border border-indigo-100 bg-indigo-50/70 p-5 shadow-inner">
              <p className="text-sm font-semibold text-indigo-700">Preview hasil yang kamu dapet:</p>
              <div className="mt-3 space-y-3">
                {['Headline jualan yang jelas', 'Poin manfaat yang meyakinkan', 'CTA yang langsung ngajak beli'].map((item) => (
                  <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    ✅ {item}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section id="problem" className={`mt-5 ${sectionCardClass}`}>
          <h2 className="text-2xl font-bold text-slate-900">{landingCopy.problem.title}</h2>
          <p className="mt-3 text-slate-700">{landingCopy.problem.intro}</p>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {landingCopy.problem.points.map((point) => (
              <li key={point} className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-sm text-slate-700">
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-slate-700">{landingCopy.problem.emotion}</p>
        </section>

        <section id="solution" className={`mt-5 ${sectionCardClass}`}>
          <h2 className="text-2xl font-bold text-slate-900">{landingCopy.solution.title}</h2>
          <p className="mt-3 text-slate-600">{landingCopy.solution.body}</p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {landingCopy.solution.points.map((point) => (
              <li key={point} className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-slate-700">
                ✨ {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-slate-700">{landingCopy.solution.close}</p>
        </section>

        <section id="demo" className={`mt-5 ${sectionCardClass}`}>
          <h2 className="text-2xl font-bold text-slate-900">{landingCopy.demo.title}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">{landingCopy.demo.inputTitle}</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-600">
                {landingCopy.demo.input.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-slate-800">{landingCopy.demo.outputTitle}</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-600">
                {landingCopy.demo.output.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
          <p className="mt-4 text-slate-700">{landingCopy.demo.note}</p>
          <button
            id="login"
            type="button"
            className="mt-4 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => openAuth('/workspace')}
          >
            {landingCopy.demo.cta}
          </button>
        </section>

        <section id="benefits" className={`mt-5 ${sectionCardClass}`}>
          <h2 className="text-2xl font-bold text-slate-900">{landingCopy.benefits.title}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {landingCopy.benefits.items.map((item) => (
              <article
                key={item}
                className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 text-sm text-slate-700 shadow-sm"
              >
                {item}
              </article>
            ))}
          </div>
        </section>

        <section id="proof" className={`mt-5 ${sectionCardClass}`}>
          <h2 className="text-2xl font-bold text-slate-900">{landingCopy.proof.title}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {landingCopy.proof.quotes.map((quote) => (
              <blockquote key={quote.author} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-700">“{quote.text}”</p>
                <footer className="mt-3 text-sm font-semibold text-slate-800">— {quote.author}</footer>
              </blockquote>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600">{landingCopy.proof.softProof}</p>
        </section>

        <section id="how-it-works" className={`mt-5 ${sectionCardClass}`}>
          <h2 className="text-2xl font-bold text-slate-900">{landingCopy.howItWorks.title}</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            {landingCopy.howItWorks.steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-3 font-semibold text-slate-800">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="cta"
          className="mt-5 rounded-[28px] border border-indigo-200 bg-gradient-to-br from-indigo-500 to-indigo-600 p-7 text-center text-white shadow-[0_16px_40px_rgba(79,70,229,0.45)] md:p-10"
        >
          <h2 className="text-2xl font-bold md:text-3xl">{landingCopy.cta.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/90">{landingCopy.cta.body}</p>
          <button
            type="button"
            className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
            onClick={() => openAuth('/workspace')}
          >
            {landingCopy.cta.button}
          </button>
          <p className="mt-3 text-xs text-white/80">{landingCopy.cta.note}</p>
        </section>

        <footer id="footer" className={`mt-5 ${sectionCardClass}`}>
          <p className="text-base font-bold text-slate-900">{landingCopy.footer.brand}</p>
          <p className="mt-1 text-sm text-slate-600">{landingCopy.footer.tagline}</p>

          <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-slate-800">Product</p>
              <ul className="mt-2 space-y-2 text-slate-600">
                {landingCopy.footer.productLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="rounded-md px-1 py-0.5 transition hover:text-indigo-700 hover:underline">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Support</p>
              <p className="mt-2 text-slate-600">Contact: {landingCopy.footer.support}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Legal</p>
              <ul className="mt-2 space-y-2 text-slate-600">
                {landingCopy.footer.legalLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="rounded-md px-1 py-0.5 transition hover:text-indigo-700 hover:underline">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => openAuth('/workspace')}
          >
            {landingCopy.footer.smallCta}
          </button>
        </footer>
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        postAuthRedirect={authRedirectTarget}
        title={authRedirectTarget === '/workspace' ? 'Mulai gratis sekarang' : 'Selamat datang kembali'}
      />
    </main>
  );
}
