'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CreditCard, FolderKanban, LoaderCircle, LogOut, MessageSquareText, UserCircle2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Project } from '@/types/project';

type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type DashboardSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  navItems: SidebarNavItem[];
  title?: string;
  subtitle?: string;
  profileLabel: string;
  profileSubLabel?: string;
  onSignOut?: () => void;
  signOutLoading?: boolean;
  workspaceProjects?: Project[];
  activeProjectId?: string | null;
  showWorkspaceProjects?: boolean;
};

export type { SidebarNavItem };

export function DashboardSidebar({
  isOpen,
  onClose,
  navItems,
  title = 'FLATFOREST AI',
  subtitle = 'Ruang Kerja',
  profileLabel,
  profileSubLabel,
  onSignOut,
  signOutLoading = false,
  workspaceProjects = [],
  activeProjectId = null,
  showWorkspaceProjects = false,
}: DashboardSidebarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (event.target instanceof Node && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials =
    profileLabel
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';

  return (
    <>
      <button
        type="button"
        aria-label="Tutup sidebar"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[1px] transition-opacity duration-200 lg:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-40 flex min-h-screen w-72 flex-col justify-between bg-white px-4 py-6 shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8">
          <div className="px-2">
            <p className="text-xl font-semibold tracking-tight text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          {showWorkspaceProjects ? (
            <section className="space-y-3" aria-label="Daftar proyek ruang kerja">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke menu utama
              </Link>
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">List Proyek</p>

              <div className="space-y-1.5">
                {workspaceProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/workspace?projectId=${project.id}`}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      activeProjectId === project.id
                        ? 'bg-indigo-600 text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <FolderKanban className="h-5 w-5 shrink-0" />
                    <span className="truncate">Proyek #{project.id.slice(0, 8)}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : (
            <nav className="space-y-1.5" aria-label="Main navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      item.active
                        ? 'bg-indigo-600 text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="relative rounded-2xl bg-slate-100 p-3" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-1.5 text-left transition hover:bg-slate-200/60"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">{initials}</div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Masuk sebagai</p>
                <p className="max-w-[170px] truncate text-sm font-medium text-slate-800">{profileLabel}</p>
                {profileSubLabel ? <p className="truncate text-xs text-slate-500">{profileSubLabel}</p> : null}
              </div>
            </div>
          </button>

          {profileMenuOpen ? (
            <div className="absolute bottom-[calc(100%+0.6rem)] left-0 right-0 z-50 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.16)]">
              <Link
                href="/dashboard/profile"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <UserCircle2 className="h-4 w-4" />
                Profil
              </Link>
              <Link
                href="/dashboard/support"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <MessageSquareText className="h-4 w-4" />
                Bantuan
              </Link>
              <Link
                href="/dashboard/transactions"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <CreditCard className="h-4 w-4" />
                Riwayat transaksi
              </Link>
              {onSignOut ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  disabled={signOutLoading}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {signOutLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  {signOutLoading ? 'Keluar...' : 'Keluar'}
                </button>
              ) : null}
            </div>
          ) : null}

        </div>
      </aside>
    </>
  );
}
