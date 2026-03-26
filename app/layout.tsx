import './globals.css';
import type { ReactNode } from 'react';
import { AppProviders } from '@/components/layout/AppProviders';
import { AppShell } from '@/components/layout/AppShell';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
