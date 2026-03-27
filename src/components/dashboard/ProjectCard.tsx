import Link from 'next/link';
import type { Project } from '../../types/project';
<<<<<<< codex/refactor-dashboard-layout-and-project-list-ui-trwp6t
import { IconCalendar, IconId, IconStatus, IconTag } from './icons';
=======
>>>>>>> main

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const createdDate = new Date(project.created_at).toLocaleDateString('id-ID', {
    dateStyle: 'medium',
  });

  return (
    <article className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08),0_6px_16px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(15,23,42,0.12),0_16px_28px_rgba(15,23,42,0.12)] md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">Project Workspace</h3>
<<<<<<< codex/refactor-dashboard-layout-and-project-list-ui-trwp6t
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
            <IconCalendar className="h-4 w-4" />
            <span>Created {createdDate}</span>
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            project.type === 'premium' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <IconTag className="h-4 w-4" />
          <span>{project.type === 'premium' ? 'PREMIUM' : 'FREE'}</span>
=======
          <p className="mt-1 text-sm text-slate-500">Created {createdDate}</p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            project.type === 'premium' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {project.type === 'premium' ? 'PREMIUM' : 'FREE'}
>>>>>>> main
        </span>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
<<<<<<< codex/refactor-dashboard-layout-and-project-list-ui-trwp6t
          <dt className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <IconId className="h-4 w-4" />
            <span>Project ID</span>
          </dt>
          <dd className="mt-1 break-all font-mono text-xs text-slate-600">{project.id}</dd>
        </div>
        <div>
          <dt className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <IconStatus className="h-4 w-4" />
            <span>Status</span>
          </dt>
=======
          <dt className="text-xs uppercase tracking-wide text-slate-400">Project ID</dt>
          <dd className="mt-1 break-all font-mono text-xs text-slate-600">{project.id}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Status</dt>
>>>>>>> main
          <dd className="mt-1 capitalize text-slate-700">{project.status}</dd>
        </div>
      </dl>

      <Link
        href={`/workspace?projectId=${project.id}`}
        className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-indigo-500"
      >
        Buka Workspace
      </Link>
    </article>
  );
}
