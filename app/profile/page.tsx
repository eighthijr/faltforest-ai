'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { listProjects } from '@/api/projects';
import { supabase } from '@/lib/supabaseClient';
import type { Project } from '@/types/project';

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user?.id) {
        window.location.replace('/');
        return;
      }

      setEmail(user.email ?? null);

      try {
        const projectList = await listProjects(user.id);
        setProjects(projectList);
      } catch (projectError) {
        setError(projectError instanceof Error ? projectError.message : 'Gagal memuat profil.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const stats = useMemo(() => {
    const premium = projects.filter((project) => project.type === 'premium').length;
    const free = projects.filter((project) => project.type === 'free').length;
    return { total: projects.length, premium, free };
  }, [projects]);

  if (loading) {
    return <main className="mx-auto w-full max-w-4xl px-4 py-10 text-sm text-slate-600">Memuat profil...</main>;
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Profil Akun</h1>
        <p className="mt-2 text-sm text-slate-600">Kelola informasi akun dan ringkasan aktivitas project kamu.</p>

        {error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="text-slate-500">Email</dt>
            <dd className="mt-1 font-semibold text-slate-900">{email ?? '-'}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="text-slate-500">Total Project</dt>
            <dd className="mt-1 font-semibold text-slate-900">{stats.total}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="text-slate-500">Project FREE</dt>
            <dd className="mt-1 font-semibold text-slate-900">{stats.free}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="text-slate-500">Project PREMIUM</dt>
            <dd className="mt-1 font-semibold text-slate-900">{stats.premium}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Akses Cepat</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/transactions" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Lihat Riwayat Transaksi
          </Link>
          <Link href="/dashboard" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Kembali ke Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
