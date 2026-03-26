'use client';

import { useEffect, useMemo, useReducer } from 'react';
import { createProject, listProjects } from '../../api/projects';
import { LogoutButton } from '../auth';
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
  | { type: 'CREATE_SUCCESS'; payload: Project }
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
      return { ...state, creating: false, projects: [action.payload, ...state.projects] };
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
  onUpgradeClick?: () => void;
};

export function ProjectDashboard({ userId, onUpgradeClick }: ProjectDashboardProps) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  useEffect(() => {
    const load = async () => {
      dispatch({ type: 'LOAD_START' });

      try {
        const projects = await listProjects(userId);
        dispatch({ type: 'LOAD_SUCCESS', payload: projects });
      } catch (error) {
        dispatch({ type: 'LOAD_ERROR', payload: error instanceof Error ? error.message : 'Gagal memuat project.' });
      }
    };

    void load();
  }, [userId]);

  const hasFreeProject = useMemo(
    () => state.projects.some((project) => project.type === 'free'),
    [state.projects],
  );

  const handleCreateProject = async () => {
    dispatch({ type: 'CREATE_START' });

    const result = await createProject({ userId, type: 'free' });

    if (!result.ok) {
      if (result.reason === 'FREE_LIMIT_REACHED') {
        dispatch({ type: 'OPEN_UPGRADE' });
        return;
      }

      dispatch({ type: 'CREATE_ERROR', payload: result.message });
      return;
    }

    dispatch({ type: 'CREATE_SUCCESS', payload: result.project });
  };

  return (
    <section className="mx-auto w-full max-w-5xl p-4 md:p-6">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Project</h1>
          <p className="text-slate-600">Kelola semua project kamu di satu tempat.</p>
        </div>

        <div className="flex flex-wrap items-start gap-2 md:justify-end">
          <button
            type="button"
            onClick={handleCreateProject}
            disabled={state.creating}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {state.creating ? 'Membuat...' : 'Buat Project'}
          </button>
          <LogoutButton />
        </div>
      </header>

      {hasFreeProject && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Kamu sudah memakai 1 project FREE. Untuk tambah project, silakan upgrade ke PREMIUM.
        </p>
      )}

      {state.error && (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{state.error}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Project ID</th>
              <th className="px-4 py-3 font-semibold">Tipe</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {state.loading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={4}>
                  Memuat project...
                </td>
              </tr>
            ) : state.projects.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={4}>
                  Belum ada project.
                </td>
              </tr>
            ) : (
              state.projects.map((project) => (
                <tr key={project.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{project.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        project.type === 'premium'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {project.type === 'premium' ? 'PREMIUM' : 'FREE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{project.status}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {new Date(project.created_at).toLocaleDateString('id-ID', {
                      dateStyle: 'medium',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UpgradeModal
        open={state.showUpgradeModal}
        onClose={() => dispatch({ type: 'CLOSE_UPGRADE' })}
        onUpgrade={() => {
          dispatch({ type: 'CLOSE_UPGRADE' });
          onUpgradeClick?.();
        }}
      />
    </section>
  );
}
