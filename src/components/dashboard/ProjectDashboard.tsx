'use client';

import { useEffect, useMemo, useReducer } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createProject, listProjects } from '../../api/projects';
import { LogoutButton } from '../auth';
import { Spinner, useToast } from '../ui';
import type { Project } from '../../types/project';
import { UpgradeModal } from './UpgradeModal';

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
  onUpgradeClick?: (projectId?: string) => void;
};

const navItems = ['Overview', 'Deployments', 'Logs', 'Analytics', 'Domains'];

export function ProjectDashboard({ userId, onUpgradeClick }: ProjectDashboardProps) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const router = useRouter();
  const { pushToast } = useToast();

  useEffect(() => {
    const load = async () => {
      dispatch({ type: 'LOAD_START' });

      try {
        const projects = await listProjects(userId);
        dispatch({ type: 'LOAD_SUCCESS', payload: projects });
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
      router.push(`/workspace?${params.toString()}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? `${error.message}. Project berhasil dibuat, tapi list belum sinkron. Coba refresh halaman.`
          : 'Project berhasil dibuat, tapi list belum sinkron. Coba refresh halaman.';
      dispatch({
        type: 'CREATE_ERROR',
        payload: message,
      });
      pushToast({ type: 'error', title: 'Sinkronisasi gagal', description: message });
    }
  };

  return (
    <section className="material-dark-page mx-auto min-h-screen w-full max-w-[1440px] p-3 text-slate-100 md:p-6">
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="material-dark-surface hidden p-4 xl:block">
          <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <p className="text-sm font-semibold">faltforest-ai</p>
              <p className="text-xs text-slate-400">Hobby Workspace</p>
            </div>
            <span className="material-dark-chip">Live</span>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  item === 'Overview' ? 'bg-slate-800 font-semibold text-white' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <header className="material-dark-surface p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-slate-200">Overview</span>
            </div>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Production Dashboard</h1>
                <p className="mt-1 text-sm text-slate-400">Layout baru mengikuti gaya panel modern dengan prinsip Material: hierarchy, spacing, dan focus action.</p>
                <p className="mt-2 text-xs text-slate-500">Kuota FREE: {freeProjectCount}/1 · {hasFreeProject ? 'Upgrade untuk tambah project baru.' : 'Masih tersedia 1 project gratis.'}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCreateProject}
                  disabled={state.creating}
                  className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,70,229,0.35)] disabled:opacity-60"
                >
                  {state.creating ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner className="text-white" />
                      Membuat...
                    </span>
                  ) : (
                    'Buat Project'
                  )}
                </button>
                {state.projects[0] && (
                  <Link href={`/workspace?projectId=${state.projects[0].id}`} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200">
                    Lanjutkan Workspace
                  </Link>
                )}
                <LogoutButton />
              </div>
            </div>
          </header>

          {hasFreeProject && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              Kamu sudah memakai project FREE. Upgrade ke PREMIUM untuk menambah project baru.
            </p>
          )}

          {state.error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{state.error}</p>}

          <article className="material-dark-surface overflow-hidden">
            <div className="border-b border-slate-800 px-4 py-3">
              <h2 className="font-medium text-slate-100">Project Workspace</h2>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {state.loading ? (
                <p className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-6 text-sm text-slate-400">Memuat project...</p>
              ) : state.projects.length === 0 ? (
                <p className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-6 text-sm text-slate-400">Belum ada project. Klik &quot;Buat Project&quot; untuk mulai workflow.</p>
              ) : (
                state.projects.map((project) => (
                  <article key={project.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Project ID</p>
                    <p className="mt-1 break-all font-mono text-xs text-slate-300">{project.id}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${
                          project.type === 'premium' ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {project.type === 'premium' ? 'PREMIUM' : 'FREE'}
                      </span>
                      <span className="capitalize text-slate-400">{project.status}</span>
                      <span className="text-slate-500">
                        {new Date(project.created_at).toLocaleDateString('id-ID', {
                          dateStyle: 'medium',
                        })}
                      </span>
                    </div>
                    <Link href={`/workspace?projectId=${project.id}`} className="mt-3 inline-flex text-sm font-semibold text-indigo-300 hover:text-indigo-200">
                      Buka Workspace
                    </Link>
                  </article>
                ))
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Project ID</th>
                    <th className="px-4 py-3 font-medium">Tipe</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Dibuat</th>
                    <th className="px-4 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {state.loading ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-400" colSpan={5}>
                        Memuat project...
                      </td>
                    </tr>
                  ) : state.projects.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-400" colSpan={5}>
                        Belum ada project. Klik &quot;Buat Project&quot; untuk mulai workflow.
                      </td>
                    </tr>
                  ) : (
                    state.projects.map((project) => (
                      <tr key={project.id} className="border-t border-slate-800/90">
                        <td className="px-4 py-3 font-mono text-xs text-slate-300">{project.id}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              project.type === 'premium' ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {project.type === 'premium' ? 'PREMIUM' : 'FREE'}
                          </span>
                        </td>
                        <td className="px-4 py-3 capitalize text-slate-300">{project.status}</td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(project.created_at).toLocaleDateString('id-ID', {
                            dateStyle: 'medium',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/workspace?projectId=${project.id}`} className="text-sm font-semibold text-indigo-300 hover:text-indigo-200">
                            Buka Workspace
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </div>

      <UpgradeModal
        open={state.showUpgradeModal}
        onClose={() => dispatch({ type: 'CLOSE_UPGRADE' })}
        onUpgrade={() => {
          dispatch({ type: 'CLOSE_UPGRADE' });
          onUpgradeClick?.(state.projects[0]?.id);
        }}
      />
    </section>
  );
}
