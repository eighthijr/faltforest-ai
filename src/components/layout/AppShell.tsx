'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type NavItem = { href: string; label: string };

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

  if (!isAdmin) {
    return <div className="material-page min-h-screen text-slate-900">{children}</div>;
  }

  return (
    <div className="material-page min-h-screen text-slate-900">
      <header className="sticky top-0 z-40">
        <div className="mx-auto mt-3 flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
          <Link href="/admin" className="text-sm font-extrabold tracking-tight text-slate-900">
            Faltforest Admin
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-1.5">
            {adminNavItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors md:text-sm ${
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
