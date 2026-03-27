'use client';

import Link from 'next/link';
import { LogOut, MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
  onSignOut?: () => void;
};

export type { SidebarNavItem };

export function DashboardSidebar({
  isOpen,
  onClose,
  navItems,
  title = 'Faltforest AI',
  subtitle = 'Workspace',
  profileLabel,
  onSignOut,
}: DashboardSidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-950/30 transition-opacity duration-200 lg:hidden ${
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
        </div>

        <div className="rounded-2xl bg-slate-100 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">Signed in as</p>
              <p className="max-w-[170px] truncate text-sm font-medium text-slate-800">{profileLabel}</p>
            </div>
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </div>
          {onSignOut ? (
            <button
              type="button"
              onClick={onSignOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : null}
        </div>
      </aside>
    </>
  );
}
