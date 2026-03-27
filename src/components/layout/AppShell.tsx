'use client';

import type { ReactNode } from 'react';
import { MessageSquareText } from 'lucide-react';

export function AppShell({ children }: { children: ReactNode }) {
  const csWhatsappNumber = process.env.NEXT_PUBLIC_CS_WHATSAPP_NUMBER ?? '6281234567890';
  const whatsappLink = `https://wa.me/${csWhatsappNumber}?text=${encodeURIComponent('Halo CS Faltforest, saya butuh bantuan.')}`;

  return (
    <div className="material-page min-h-screen text-slate-900">
      {children}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        aria-label="Hubungi customer support via WhatsApp"
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_8px_22px_rgba(16,185,129,0.45)] transition hover:scale-105 hover:bg-emerald-400"
      >
        <MessageSquareText className="h-7 w-7" />
      </a>
    </div>
  );
}
