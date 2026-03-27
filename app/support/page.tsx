import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';

export default function SupportPage() {
  const csWhatsappNumber = process.env.NEXT_PUBLIC_CS_WHATSAPP_NUMBER ?? '6281234567890';
  const whatsappLink = `https://wa.me/${csWhatsappNumber}?text=${encodeURIComponent('Halo CS FLATFOREST, saya butuh bantuan.')}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10">
      <section className="w-full rounded-3xl bg-white p-8 shadow-[0_8px_26px_rgba(15,23,42,0.12)]">
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <MessageSquareText className="h-4 w-4" />
          Customer Support
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">Butuh bantuan?</h1>
        <p className="mt-2 text-sm text-slate-600">Hubungi tim CS FLATFOREST via WhatsApp dari halaman ini.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            <MessageSquareText className="h-4 w-4" />
            Chat via WhatsApp
          </a>
          <Link href="/" className="inline-flex rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">
            Kembali ke landing
          </Link>
        </div>
      </section>
    </main>
  );
}
