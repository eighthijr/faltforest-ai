'use client';

import { useEffect, useMemo, useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, deleteProject, listProjects } from '../../api/projects';
import { listPaymentHistory, type PaymentStatus } from '@/api/payments';
import { Spinner, useToast } from '../ui';
import type { Project } from '../../types/project';
import { DashboardLayout } from './DashboardLayout';
import { DashboardCard } from './DashboardCard';
import { UpgradeModal } from './UpgradeModal';
import { DeleteProjectModal } from './DeleteProjectModal';

type DashboardState = {
  loading: boolean;
  creating: boolean;
  projects: Project[];
  error: string | null;
  showUpgradeModal: boolean;
};

type DashboardAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Project[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; payload: Project[] }
  | { type: 'CREATE_ERROR'; payload: string }
  | { type: 'OPEN_UPGRADE' }
  | { type: 'CLOSE_UPGRADE' };

const initialState: DashboardState = {
  loading: true,
  creating: false,
  projects: [],
  error: null,
  showUpgradeModal: false,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, loading: false, projects: action.payload, error: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_START':
      return { ...state, creating: true, error: null };
    case 'CREATE_SUCCESS':
      return { ...state, creating: false, projects: action.payload, error: null };
    case 'CREATE_ERROR':
      return { ...state, creating: false, error: action.payload };
    case 'OPEN_UPGRADE':
      return { ...state, creating: false, showUpgradeModal: true };
    case 'CLOSE_UPGRADE':
      return { ...state, showUpgradeModal: false };
    default:
      return state;
  }
}

type ProjectDashboardProps = {
  userId: string;
  userEmail?: string | null;
  onUpgradeClick?: (projectId?: string) => void;
};

export function ProjectDashboard({ userId, userEmail, onUpgradeClick }: ProjectDashboardProps) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const router = useRouter();
  const { pushToast } = useToast();

  useEffect(() => {
    const load = async () => {
      dispatch({ type: 'LOAD_START' });

      try {
        const projects = await listProjects(userId);
        dispatch({ type: 'LOAD_SUCCESS', payload: projects });

        const payments = await listPaymentHistory();
        const latestStatusByProject: Record<string, PaymentStatus> = {};
        payments.forEach((payment) => {
          if (!latestStatusByProject[payment.project_id]) {
            latestStatusByProject[payment.project_id] = payment.status;
          }
        });
        setProjectPaymentStatus(latestStatusByProject);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal memuat project.';
        dispatch({ type: 'LOAD_ERROR', payload: message });
        pushToast({ type: 'error', title: 'Gagal memuat project', description: message });
      }
    };

    void load();
  }, [userId, pushToast]);

  const freeProjectCount = useMemo(
    () => state.projects.filter((project) => project.type === 'free').length,
    [state.projects],
  );
  const hasFreeProject = freeProjectCount > 0;
  const [projectPaymentStatus, setProjectPaymentStatus] = useState<Record<string, PaymentStatus>>({});
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);

  const handleCreateProject = async () => {
    dispatch({ type: 'CREATE_START' });

    const result = await createProject({ userId, type: 'free' });

    if (!result.ok) {
      if (result.reason === 'FREE_LIMIT_REACHED') {
        dispatch({ type: 'OPEN_UPGRADE' });
        pushToast({ type: 'info', title: 'Kuota FREE habis', description: 'Upgrade untuk menambah project baru.' });
        return;
      }

      dispatch({ type: 'CREATE_ERROR', payload: result.message });
      pushToast({ type: 'error', title: 'Gagal membuat project', description: result.message });
      return;
    }

    try {
      const refreshedProjects = await listProjects(userId);
      dispatch({ type: 'CREATE_SUCCESS', payload: refreshedProjects });
      pushToast({ type: 'success', title: 'Project berhasil dibuat', description: 'Mengarahkan kamu ke workspace...' });
      const params = new URLSearchParams({
        projectId: result.project.id,
        projectType: result.project.type,
        projectStatus: result.project.status,
      });
      router.push(`/dashboard/workspace?${params.toString()}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? `${error.message}. Project berhasil dibuat, tapi list belum sinkron. Coba refresh halaman.`
          : 'Project berhasil dibuat, tapi list belum sinkron. Coba refresh halaman.';
      dispatch({ type: 'CREATE_ERROR', payload: message });
      pushToast({ type: 'error', title: 'Sinkronisasi gagal', description: message });
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeletingProject(true);

    try {
      await deleteProject({ userId, projectId: projectToDelete.id });
      const refreshedProjects = await listProjects(userId);
      dispatch({ type: 'LOAD_SUCCESS', payload: refreshedProjects });
      pushToast({ type: 'success', title: 'Project dihapus', description: 'Project berhasil dihapus dari dashboard.' });
      setProjectToDelete(null);
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Gagal hapus project',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
      });
    } finally {
      setDeletingProject(false);
    }
  };

  return (
    <DashboardLayout userId={userId} userEmail={userEmail}>
      <section className="space-y-6">
        <header className="rounded-3xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.08)] md:p-6">
          <p className="text-sm text-slate-500">Dashboard / Ringkasan</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">Kelola project, lanjutkan workspace, dan pantau status generate secara real-time.</p>
              <p className="mt-2 text-sm text-slate-500">Paket gratis: {freeProjectCount}/1 project · {hasFreeProject ? 'Upgrade untuk project tambahan.' : 'Siap mulai project pertama kamu.'}</p>
            </div>

            <button
              type="button"
              onClick={handleCreateProject}
              disabled={state.creating}
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(79,70,229,0.24),0_8px_16px_rgba(79,70,229,0.2)] transition-all duration-200 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {state.creating ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="text-white" />
                  Membuat project...
                </span>
              ) : (
                'Buat Project'
              )}
            </button>
          </div>
        </header>

        {hasFreeProject && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-[0_1px_2px_rgba(146,64,14,0.12)]">
            Kuota project gratis sudah terpakai. Upgrade untuk membuka project tambahan.
          </p>
        )}

        {state.error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-[0_1px_2px_rgba(190,24,93,0.14)]">{state.error}</p>}

        {state.loading ? (
          <p className="rounded-2xl bg-white px-4 py-8 text-sm text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.08)]">Memuat project...</p>
        ) : state.projects.length === 0 ? (
          <p className="rounded-2xl bg-white px-4 py-8 text-sm text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.08)]">
            Belum ada project. Klik &quot;Buat Project&quot; untuk mulai workflow.
          </p>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {state.projects.map((project) => (
              <DashboardCard
                key={project.id}
                project={project}
                paymentStatus={projectPaymentStatus[project.id] ?? null}
                onDelete={(selected) => setProjectToDelete(selected)}
              />
            ))}
          </section>
        )}
      </section>

      <DeleteProjectModal
        open={Boolean(projectToDelete)}
        projectId={projectToDelete?.id ?? null}
        deleting={deletingProject}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
      />

      <UpgradeModal
        open={state.showUpgradeModal}
        onClose={() => dispatch({ type: 'CLOSE_UPGRADE' })}
        onUpgrade={() => {
          dispatch({ type: 'CLOSE_UPGRADE' });
          onUpgradeClick?.(state.projects[0]?.id);
        }}
      />
    </DashboardLayout>
  );
}
