'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { BarChart3, LayoutDashboard, Menu, MessageSquareText, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { DashboardSidebar, type SidebarNavItem } from './DashboardSidebar';
import { DashboardSidebarProvider } from './DashboardSidebarContext';
import type { Project } from '@/types/project';

type DashboardLayoutProps = {
  children: ReactNode;
  userId: string;
  userEmail?: string | null;
  mode?: 'user' | 'admin';
  workspaceProjects?: Project[];
  activeProjectId?: string | null;
};

const userNav: Array<Omit<SidebarNavItem, 'active'>> = [
  { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { href: '/dashboard/workspace', label: 'Ruang Kerja', icon: MessageSquareText },
];

const adminNav: Array<Omit<SidebarNavItem, 'active'>> = [
  { href: '/dashboard', label: 'Pembayaran', icon: ShieldCheck },
  { href: '/dashboard/analytics', label: 'Analitik', icon: BarChart3 },
  { href: '/dashboard/workspace', label: 'Ruang Kerja', icon: MessageSquareText },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardLayout({ children, userId, userEmail, mode = 'user', workspaceProjects = [], activeProjectId = null }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  const isWorkspaceRoute = pathname.startsWith('/dashboard/workspace');

  const navItems = useMemo(() => {
    const source = mode === 'admin' ? adminNav : userNav;
    return source.map((item) => ({ ...item, active: isActive(pathname, item.href) }));
  }, [mode, pathname]);

  const handleSignOut = async () => {
    if (signOutLoading) return;

    setSignOutLoading(true);
    await supabase.auth.signOut();
    window.location.replace('/');
  };

  return (
    <div className="material-page min-h-screen bg-slate-100 text-slate-900">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
        title={mode === 'admin' ? 'FLATFOREST Admin' : 'FLATFOREST AI'}
        subtitle={mode === 'admin' ? 'Panel kontrol' : 'Pembuat landing page'}
        profileLabel={userEmail ?? userId}
        onSignOut={handleSignOut}
        signOutLoading={signOutLoading}
        workspaceProjects={workspaceProjects}
        activeProjectId={activeProjectId}
        showWorkspaceProjects={pathname.startsWith('/dashboard/workspace')}
      />

      <DashboardSidebarProvider value={{ toggleSidebar: () => setSidebarOpen((prev) => !prev) }}>
        <div className="min-h-screen lg:pl-72">
          {!isWorkspaceRoute ? (
            <header className="sticky top-0 z-20 bg-slate-100/95 px-4 py-4 backdrop-blur lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Toggle sidebar"
                className="material-btn-outline rounded-xl p-3 text-slate-700"
              >
                <Menu className="h-5 w-5" />
              </button>
            </header>
          ) : null}
          <main className="w-full px-4 py-4 md:px-6 md:py-6">{children}</main>
        </div>
      </DashboardSidebarProvider>
    </div>
  );
}
