'use client';

import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="material-page min-h-screen text-slate-900">{children}</div>;
}
