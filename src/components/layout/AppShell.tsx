'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type NavItem = { href: string; label: string };

const appNavItems: NavItem[] = [
  { href: '/', label: 'Landing' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/workspace', label: 'Workspace' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/transactions', label: 'Riwayat' },
  { href: '/profile', label: 'Profil' },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Admin' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/dashboard', label: 'Dashboard User' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const navItems = isAdmin ? adminNavItems : appNavItems;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href={isAdmin ? '/admin' : '/'} className="text-sm font-extrabold tracking-tight text-slate-900">
            {isAdmin ? 'Faltforest Admin' : 'Faltforest AI'}
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-1.5">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors md:text-sm ${
                    active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
