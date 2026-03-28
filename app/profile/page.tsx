'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, Mail, ShieldCheck } from 'lucide-react';
import { listProjects } from '@/api/projects';
import { DashboardLayout } from '@/components/dashboard';
import { useProtectedRoute } from '@/components/auth';
import type { Project } from '@/types/project';

export default function ProfilPage() {
  const { userId, loading: authLoading, error: authError } = useProtectedRoute('/');
  const [email, setEmail] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const { supabase } = await import('@/lib/supabaseClient');
        const { data } = await supabase.auth.getUser();
        setEmail(data.user?.email ?? null);
        const projectList = await listProjects(userId);
        setProjects(projectList);
      } catch (projectError) {
        setError(projectError instanceof Error ? projectError.message : 'Gagal memuat profil.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [userId]);

  const stats = useMemo(() => {
    const premium = projects.filter((project) => project.type === 'premium').length;
    const free = projects.filter((project) => project.type === 'free').length;
    return { total: projects.length, premium, free };
  }, [projects]);

  if (authLoading) {
    return <main className="px-4 py-10 text-sm text-slate-600">Memeriksa autentikasi...</main>;
  }

  if (authError || !userId) {
    return <main className="px-4 py-10 text-sm text-rose-700">{authError ?? 'Session tidak ditemukan.'}</main>;
  }

  return (
    <DashboardLayout userId={userId}>
      <section className="space-y-4">
        <article className="rounded-3xl bg-white p-6 shadow-[0_3px_12px_rgba(15,23,42,0.1)]">
          <h1 className="text-2xl font-semibold text-slate-900">Profil</h1>
          <p className="mt-1 text-sm text-slate-600">Kelola informasi akun dan ringkasan penggunaan.</p>

          {(loading || error) && <p className="mt-3 text-sm text-slate-600">{loading ? 'Memuat profil...' : error}</p>}

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500"><Mail className="h-4 w-4" />Email</dt>
              <dd className="mt-1 font-medium text-slate-900">{email ?? '-'}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500"><FolderKanban className="h-4 w-4" />Total Proyek</dt>
              <dd className="mt-1 font-medium text-slate-900">{stats.total}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Proyek paket gratis</dt>
              <dd className="mt-1 font-medium text-slate-900">{stats.free}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500"><ShieldCheck className="h-4 w-4" />Proyek premium</dt>
              <dd className="mt-1 font-medium text-slate-900">{stats.premium}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-[0_3px_12px_rgba(15,23,42,0.1)]">
          <h2 className="text-lg font-semibold text-slate-900">Akses cepat</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/dashboard/transactions" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Riwayat Transaksi</Link>
            <Link href="/dashboard" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Kembali ke Dashboard</Link>
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
