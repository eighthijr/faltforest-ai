'use client';

import Link from 'next/link';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { LogoutButton } from '../auth';
import { IconChevronDown, IconUser } from './icons';

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type SidebarNavItem = {
  href: string;
  label: string;
  active?: boolean;
  icon: NavIcon;
};

type DashboardSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  navItems: SidebarNavItem[];
  userId: string;
  logo?: ReactNode;
};

const sidebarBaseClass =
  'fixed left-0 top-0 z-40 flex min-h-screen w-72 flex-col justify-between bg-white p-6 shadow-[0_2px_6px_rgba(15,23,42,0.08),0_12px_24px_rgba(15,23,42,0.1)] transition-transform duration-300 ease-out lg:translate-x-0';

export function DashboardSidebar({ isOpen, onClose, navItems, userId, logo }: DashboardSidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-950/20 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside className={`${sidebarBaseClass} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Sidebar">
        <div className="space-y-8">
          <div>
            {logo ?? <p className="text-lg font-semibold tracking-tight text-slate-900">faltforest-ai</p>}
            <p className="mt-1 text-sm text-slate-500">Dashboard</p>
          </div>

          <nav aria-label="Main navigation" className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-indigo-100 text-indigo-700 shadow-[0_1px_2px_rgba(79,70,229,0.2)]'
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

        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-200">
            <span className="inline-flex items-center gap-3">
              <IconUser className="h-5 w-5 text-slate-500" />
              <span>
                <span className="block font-medium text-slate-900">Signed in</span>
                <span className="block max-w-[156px] truncate text-xs text-slate-500">{userId}</span>
              </span>
            </span>
            <IconChevronDown className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.1),0_12px_20px_rgba(15,23,42,0.08)]">
            <p className="mb-3 text-xs text-slate-500">Manage your account session</p>
            <LogoutButton />
          </div>
        </details>
      </aside>
    </>
  );
}
