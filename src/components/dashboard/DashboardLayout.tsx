'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { BarChart3, CreditCard, LayoutDashboard, Menu, MessageSquareText, ShieldCheck, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { DashboardSidebar, type SidebarNavItem } from './DashboardSidebar';

type DashboardLayoutProps = {
  children: ReactNode;
  userId: string;
  mode?: 'user' | 'admin';
};

const userNav: Array<Omit<SidebarNavItem, 'active'>> = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workspace', label: 'Workspace', icon: MessageSquareText },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/profile', label: 'Profile', icon: User },
];

const adminNav: Array<Omit<SidebarNavItem, 'active'>> = [
  { href: '/dashboard', label: 'Payments', icon: ShieldCheck },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/workspace', label: 'Workspace', icon: MessageSquareText },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/profile', label: 'Profile', icon: User },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardLayout({ children, userId, mode = 'user' }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = useMemo(() => {
    const source = mode === 'admin' ? adminNav : userNav;
    return source.map((item) => ({ ...item, active: isActive(pathname, item.href) }));
  }, [mode, pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.replace('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
        title={mode === 'admin' ? 'Faltforest Admin' : 'Faltforest AI'}
        subtitle={mode === 'admin' ? 'Control panel' : 'Landing page generator'}
        profileLabel={userId}
        onSignOut={handleSignOut}
      />

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 bg-slate-100/95 px-4 py-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle sidebar"
            className="inline-flex items-center justify-center rounded-xl bg-white p-3 text-slate-700 shadow-[0_3px_12px_rgba(15,23,42,0.14)]"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <main className="w-full px-4 py-4 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
