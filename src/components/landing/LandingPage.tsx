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
        <p className="text-base font-bold text-slate-900">{landingCopy.navbar.logo}</p>
        <nav aria-label="Main menu" className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
          {landingCopy.navbar.menu.map((item) => (
            <a key={item.label} href={item.href} className="hover:text-indigo-700 hover:underline">
              {item.label}
            </a>
          ))}
          <button
            id="login"
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => openAuth('/dashboard')}
          >
            {landingCopy.navbar.login}
          </button>
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            onClick={() => openAuth('/workspace')}
          >
            {landingCopy.navbar.cta}
          </button>
        </nav>
      </header>

      <section id="hero" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">{landingCopy.hero.title}</h1>
        <p className="mt-3 max-w-3xl text-base text-slate-600 md:text-lg">{landingCopy.hero.subtitle}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-500"
            onClick={() => openAuth('/workspace')}
          >
            {landingCopy.hero.primaryCta}
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-500">{landingCopy.hero.microTrust}</p>
      </section>

      <section id="problem" className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{landingCopy.problem.title}</h2>
        <p className="mt-3 text-slate-700">{landingCopy.problem.intro}</p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-600">
          {landingCopy.problem.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="mt-3 text-slate-700">{landingCopy.problem.emotion}</p>
      </section>

      <section id="solution" className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{landingCopy.solution.title}</h2>
        <p className="mt-3 text-slate-600">{landingCopy.solution.body}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          {landingCopy.solution.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="mt-3 text-slate-700">{landingCopy.solution.close}</p>
      </section>

      <section id="demo" className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{landingCopy.demo.title}</h2>
        <p className="mt-3 font-semibold text-slate-800">{landingCopy.demo.inputTitle}</p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-600">
          {landingCopy.demo.input.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 font-semibold text-slate-800">{landingCopy.demo.outputTitle}</p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-600">
          {landingCopy.demo.output.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 text-slate-700">{landingCopy.demo.note}</p>
        <button
          type="button"
          className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
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
        <div className="mt-4 grid gap-3">
          {landingCopy.proof.quotes.map((quote) => (
            <blockquote key={quote.author} className="rounded-xl border-l-4 border-indigo-600 bg-indigo-50 p-4 text-slate-700">
              <p>“{quote.text}”</p>
              <footer className="mt-2 text-sm font-semibold text-slate-800">— {quote.author}</footer>
            </blockquote>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600">{landingCopy.proof.softProof}</p>
      </section>

      <section id="how-it-works" className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{landingCopy.howItWorks.title}</h2>
        <ol className="mt-4 space-y-3">
          {landingCopy.howItWorks.steps.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">
                {index + 1}. {step.title}
              </p>
              <p className="mt-1 text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
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
        <p className="text-base font-bold text-slate-900">{landingCopy.footer.brand}</p>
        <p className="mt-1 text-sm text-slate-600">{landingCopy.footer.tagline}</p>

        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-800">Product</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              {landingCopy.footer.productLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-indigo-700 hover:underline">
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
            <ul className="mt-2 space-y-1 text-slate-600">
              {landingCopy.footer.legalLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-indigo-700 hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={() => openAuth('/workspace')}
        >
          {landingCopy.footer.smallCta}
        </button>
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
