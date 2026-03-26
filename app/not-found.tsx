import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
      <p className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">404</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-lg text-sm text-slate-600">
        Sepertinya alamat yang kamu tuju tidak tersedia atau sudah dipindahkan. Coba kembali ke halaman utama untuk lanjut bekerja.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Link href="/" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          Ke Landing
        </Link>
        <Link href="/dashboard" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
          Ke Dashboard
        </Link>
      </div>
    </main>
  );
}
