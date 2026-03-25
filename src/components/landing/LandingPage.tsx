 'use client';

import { useState } from 'react';
import { landingCopy } from './landingCopy.id';
import { AuthModal } from '../auth';
import '../../styles/landing-page.css';

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authRedirectTarget, setAuthRedirectTarget] = useState<'/dashboard' | '/workspace'>('/workspace');

  const openAuth = (target: '/dashboard' | '/workspace') => {
    setAuthRedirectTarget(target);
    setAuthOpen(true);
  };

  return (
    <main className="lp-root">
      <header className="lp-nav">
        <p className="lp-brand">Faltforest AI</p>
        <button type="button" className="lp-btn-secondary" onClick={() => openAuth('/dashboard')}>
          Login
        </button>
      </header>

      <section className="lp-hero" id="hero">
        <p className="lp-badge">{landingCopy.hero.badge}</p>
        <h1>{landingCopy.hero.title}</h1>
        <p>{landingCopy.hero.subtitle}</p>
        <div className="lp-row">
          <button type="button" className="lp-btn-primary" onClick={() => openAuth('/workspace')}>
            {landingCopy.hero.primaryCta}
          </button>
          <a href="#demo" className="lp-btn-secondary">
            {landingCopy.hero.secondaryCta}
          </a>
        </div>
      </section>

      <section id="problem">
        <h2>{landingCopy.problem.title}</h2>
        <ul>
          {landingCopy.problem.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section id="solution">
        <h2>{landingCopy.solution.title}</h2>
        <p>{landingCopy.solution.body}</p>
      </section>

      <section id="demo">
        <h2>{landingCopy.demo.title}</h2>
        <ol>
          {landingCopy.demo.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <button type="button" className="lp-btn-primary" onClick={() => openAuth('/workspace')}>
          {landingCopy.demo.cta}
        </button>
      </section>

      <section id="benefits">
        <h2>{landingCopy.benefits.title}</h2>
        <div className="lp-grid">
          {landingCopy.benefits.items.map((item) => (
            <article key={item} className="lp-card">
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="proof">
        <h2>{landingCopy.proof.title}</h2>
        <div className="lp-grid lp-proof-stats">
          {landingCopy.proof.stats.map((stat) => (
            <article key={stat.label} className="lp-card">
              <strong>{stat.value}</strong>
              <p>{stat.label}</p>
            </article>
          ))}
        </div>
        <div className="lp-proof-quotes">
          {landingCopy.proof.quotes.map((quote) => (
            <blockquote key={quote}>{quote}</blockquote>
          ))}
        </div>
      </section>

      <section id="cta" className="lp-cta">
        <h2>{landingCopy.cta.title}</h2>
        <p>{landingCopy.cta.body}</p>
        <button type="button" className="lp-btn-primary" onClick={() => openAuth('/workspace')}>
          {landingCopy.cta.button}
        </button>
        <small>{landingCopy.cta.note}</small>
      </section>

      <footer id="footer" className="lp-footer">
        <p>{landingCopy.footer.text}</p>
        <nav aria-label="Footer">
          <ul className="lp-row lp-links">
            {landingCopy.footer.links.map((link) => (
              <li key={link}>
                <a href="#hero">{link}</a>
              </li>
            ))}
          </ul>
        </nav>
      </footer>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        postAuthRedirect={authRedirectTarget}
        title={authRedirectTarget === '/workspace' ? 'Mulai gratis sekarang' : 'Welcome back'}
      />
    </main>
  );
}
