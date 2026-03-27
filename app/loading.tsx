import { Spinner } from '@/components/ui';

export default function GlobalLoading() {
  return (
    <div className="material-page flex min-h-screen items-center justify-center px-6">
      <div className="rounded-3xl bg-white px-6 py-5 text-center shadow-[0_6px_24px_rgba(15,23,42,0.12)]">
        <Spinner size="md" className="mx-auto text-indigo-600" />
        <p className="mt-3 text-sm font-semibold text-slate-800">Memuat halaman...</p>
      </div>
    </div>
  );
}
