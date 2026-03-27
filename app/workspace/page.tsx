'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { listProjects } from '@/api/projects';
import { WorkspaceChat } from '@/components/workspace';
import { DashboardLayout } from '@/components/dashboard';
import { useProtectedRoute } from '@/components/auth';
import type { Project } from '@/types/project';

function isProjectType(value: string | null): value is Project['type'] {
  return value === 'free' || value === 'premium';
}

function isProjectStatus(value: string | null): value is Project['status'] {
  return value === 'draft' || value === 'ready' || value === 'generated';
}

export default function WorkspacePage() {
  const { userId, email, loading: authLoading, error: authError } = useProtectedRoute('/');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkspaceProject = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams(window.location.search);
        const searchProjectId = params.get('projectId');
        const searchProjectType = params.get('projectType');
        const searchProjectStatus = params.get('projectStatus');
        const userProjects = await listProjects(userId);

        const preferredProject = searchProjectId
          ? userProjects.find((project) => project.id === searchProjectId) ?? null
          : null;

        const fallbackProject =
          searchProjectId && isProjectType(searchProjectType) && isProjectStatus(searchProjectStatus)
            ? {
                id: searchProjectId,
                user_id: userId,
                type: searchProjectType,
                status: searchProjectStatus,
                generated_html: null,
                created_at: new Date().toISOString(),
              }
            : null;

        const resolvedProject = preferredProject ?? userProjects[0] ?? fallbackProject;

        if (searchProjectId && !preferredProject) {
          setError('Project tidak ditemukan atau kamu tidak punya akses.');
        }

        setProjects(userProjects);
        setSelectedProject(resolvedProject);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Gagal memuat project workspace.');
      } finally {
        setLoading(false);
      }
    };

    void loadWorkspaceProject();
  }, [userId]);

  if (authLoading || loading) {
    return <p className="material-page p-6 text-sm text-slate-600">Checking workspace access...</p>;
  }

  if (authError || !userId) {
    return <p className="material-page p-6 text-sm text-rose-700">{authError ?? 'Session tidak ditemukan.'}</p>;
  }

  if (!selectedProject) {
    return (
      <DashboardLayout userId={userId} userEmail={email}>
        <section className="rounded-3xl bg-white p-6 shadow-[0_3px_12px_rgba(15,23,42,0.1)]">
          <h1 className="text-xl font-semibold text-slate-900">Workspace unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">Buat project dulu dari dashboard untuk membuka chatroom AI.</p>
          <Link href="/dashboard" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Open Dashboard
          </Link>
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userId={userId} userEmail={email} workspaceProjects={projects} activeProjectId={selectedProject.id}>
      {error && (
        <p className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
      <WorkspaceChat
        projectId={selectedProject.id}
        projectType={selectedProject.type}
        initialState={selectedProject.status}
        initialGeneratedCopy={selectedProject.generated_html}
        projectCount={projects.length}
      />
    </DashboardLayout>
  );
}
