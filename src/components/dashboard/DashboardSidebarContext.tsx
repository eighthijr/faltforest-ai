'use client';

import { createContext, useContext, type ReactNode } from 'react';

type DashboardSidebarContextValue = {
  toggleSidebar: () => void;
};

const DashboardSidebarContext = createContext<DashboardSidebarContextValue | null>(null);

type DashboardSidebarProviderProps = {
  value: DashboardSidebarContextValue;
  children: ReactNode;
};

export function DashboardSidebarProvider({ value, children }: DashboardSidebarProviderProps) {
  return <DashboardSidebarContext.Provider value={value}>{children}</DashboardSidebarContext.Provider>;
}

export function useDashboardSidebar() {
  return useContext(DashboardSidebarContext);
}
