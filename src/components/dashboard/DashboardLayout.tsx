'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardSidebar, type SidebarNavItem } from './DashboardSidebar';
<<<<<<< codex/refactor-dashboard-layout-and-project-list-ui-trwp6t
import { IconDashboard, IconMenu, IconPricing, IconProfile, IconWorkspace } from './icons';
=======
>>>>>>> main

type DashboardLayoutProps = {
  children: ReactNode;
  userId: string;
};

const baseNavItems: Array<Omit<SidebarNavItem, 'active'>> = [
<<<<<<< codex/refactor-dashboard-layout-and-project-list-ui-trwp6t
  { href: '/dashboard', label: 'Overview', icon: IconDashboard },
  { href: '/workspace', label: 'Workspace', icon: IconWorkspace },
  { href: '/pricing', label: 'Pricing', icon: IconPricing },
  { href: '/profile', label: 'Profile', icon: IconProfile },
=======
  { href: '/dashboard', label: 'Overview' },
  { href: '/workspace', label: 'Workspace' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/profile', label: 'Profile' },
>>>>>>> main
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardLayout({ children, userId }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = useMemo(
    () => baseNavItems.map((item) => ({ ...item, active: isActive(pathname, item.href) })),
    [pathname],
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} navItems={navItems} userId={userId} />

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-100/95 px-4 py-4 backdrop-blur md:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle sidebar"
            className="inline-flex items-center justify-center rounded-xl bg-white p-3 text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.08),0_8px_16px_rgba(15,23,42,0.08)] transition hover:bg-slate-50"
          >
<<<<<<< codex/refactor-dashboard-layout-and-project-list-ui-trwp6t
            <IconMenu className="h-5 w-5" />
=======
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
>>>>>>> main
          </button>
        </header>

        <main className="w-full px-4 py-4 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
