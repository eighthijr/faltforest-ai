import Link from 'next/link';
import { Activity, CalendarClock, CircleCheck, CircleDashed, Crown, FlaskConical, Hash } from 'lucide-react';
import type { Project } from '@/types/project';

type DashboardCardProps = {
  project: Project;
};

const statusMap: Record<Project['status'], { label: string; tone: string; icon: typeof CircleCheck }> = {
  draft: { label: 'Draft', tone: 'bg-amber-50 text-amber-700', icon: CircleDashed },
  ready: { label: 'Generating', tone: 'bg-violet-50 text-violet-700', icon: FlaskConical },
  generated: { label: 'Generated', tone: 'bg-emerald-50 text-emerald-700', icon: CircleCheck },
};

export function DashboardCard({ project }: DashboardCardProps) {
  const createdDate = new Date(project.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' });
  const status = statusMap[project.status];
  const StatusIcon = status.icon;

  return (
    <article className="rounded-3xl bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.1)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Project Workspace</h3>
          <p className="mt-1 text-sm text-slate-500">Continue building your landing page.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          <Crown className="h-4 w-4" />
          {project.type === 'premium' ? 'Premium' : 'Free'}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm text-slate-600">
        <div className="inline-flex items-center gap-2">
          <StatusIcon className="h-4 w-4" />
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.tone}`}>{status.label}</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          <span>Created {createdDate}</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <Hash className="h-4 w-4" />
          <span className="truncate font-mono text-xs">{project.id}</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span>Last activity: recently updated</span>
        </div>
      </dl>

      <Link
        href={`/workspace?projectId=${project.id}`}
        className="mt-5 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.32)] transition hover:bg-indigo-500"
      >
        Open Workspace
      </Link>
    </article>
  );
}
