import Link from 'next/link';

type PricingPageProps = {
  searchParams?: {
    source?: string;
    reason?: string;
    projectId?: string;
  };
};

const reasonLabel: Record<string, string> = {
  download: 'Fitur download file HTML',
  chat_after_generated: 'Lanjut chat setelah landing page selesai',
  project_limit: 'Kuota 1 project untuk paket FREE',
};

export default function PricingPage({ searchParams }: PricingPageProps) {
  const source = searchParams?.source ?? 'app';
  const reason = searchParams?.reason ?? 'project_limit';
  const projectId = searchParams?.projectId;

  const requirement = reasonLabel[reason] ?? 'Akses fitur PREMIUM';

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Upgrade Premium</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Buka semua fitur tanpa batasan paywall</h1>
        <p className="mt-3 text-sm text-slate-600">
          Kamu diarahkan dari <strong>{source}</strong> karena butuh akses ke: <strong>{requirement}</strong>.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Paket FREE</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Maksimal 1 project</li>
              <li>• Bisa generate landing page</li>
              <li>• Download & lanjutan chat dikunci paywall</li>
            </ul>
          </article>

          <article className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <h2 className="text-lg font-semibold text-indigo-900">Paket PREMIUM</h2>
            <ul className="mt-3 space-y-2 text-sm text-indigo-900">
              <li>• Project lebih dari 1</li>
              <li>• Download file HTML tanpa batas</li>
              <li>• Lanjut revisi/chat setelah generate</li>
            </ul>
          </article>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Pembayaran premium diproses lewat dashboard (Manual QRIS / Tripay QRIS). Klik tombol di bawah untuk mulai checkout.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            Buka Dashboard & Upgrade
          </Link>
          <Link
            href={projectId ? `/workspace?projectId=${projectId}` : '/workspace'}
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
          >
            Kembali ke Workspace
          </Link>
        </div>
      </section>
    </main>
  );
}
