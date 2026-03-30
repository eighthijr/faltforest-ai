import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { AppProviders } from '@/components/layout/AppProviders';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  metadataBase: new URL('https://flatforest.ai'),
  title: {
    default: 'FLATFOREST AI — AI Landing Page Generator',
    template: '%s | FLATFOREST AI',
  },
  description:
    'FLATFOREST AI membantu seller dan affiliator membuat landing page conversion-ready dengan chat AI, preview instan, dan alur upgrade premium.',
  keywords: ['FLATFOREST', 'AI landing page', 'landing page generator', 'seller tools', 'affiliate marketing'],
  openGraph: {
    title: 'FLATFOREST AI — AI Landing Page Generator',
    description:
      'Buat landing page conversion-ready dalam hitungan menit. Mulai gratis, upgrade saat butuh download tanpa batas dan revisi premium.',
    type: 'website',
    siteName: 'FLATFOREST AI',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLATFOREST AI',
    description: 'AI workspace untuk membuat landing page yang lebih cepat dan lebih meyakinkan.',
  },
};

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
