'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { listProjects } from '@/api/projects';
import { supabase } from '@/lib/supabaseClient';
import { WorkspaceChat } from '@/components/workspace';
import type { Project } from '@/types/project';

export default function WorkspacePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const searchProjectId = useMemo(() => {
    return searchParams.get('projectId');
  }, [searchParams]);

  useEffect(() => {
    const loadWorkspaceProject = async () => {
      setLoading(true);
      setError(null);

      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        window.location.replace('/');
        return;
      }

      try {
        const userProjects = await listProjects(userId);
        const preferredProject = searchProjectId
          ? userProjects.find((project) => project.id === searchProjectId) ?? null
          : null;

        const resolvedProject = preferredProject ?? userProjects[0] ?? null;
        setProjects(userProjects);
        setSelectedProject(resolvedProject);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Gagal memuat project workspace.');
      } finally {
        setLoading(false);
      }
    };

    void loadWorkspaceProject();
  }, [searchProjectId]);

  if (loading) {
    return <p className="p-4 text-sm text-slate-600">Memuat workspace...</p>;
  }

  if (error) {
    return <p className="p-4 text-sm text-rose-700">Gagal memuat workspace: {error}</p>;
  }

  if (!selectedProject) {
    return (
      <section className="mx-auto mt-6 w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-900">Belum ada project</h1>
        <p className="mt-2 text-sm text-slate-600">
          Supaya bisa pakai workspace, buat project dulu dari dashboard.
        </p>
        <Link href="/dashboard" className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">
          Buka Dashboard
        </Link>
      </section>
    );
  }

  return (
    <WorkspaceChat
      projectId={selectedProject.id}
      projectType={selectedProject.type}
      initialState={selectedProject.status}
      projectCount={projects.length}
      onUpgradeClick={() => (window.location.href = '/pricing')}
    />
  );
}
