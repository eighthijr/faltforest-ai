'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, BadgeCheck, CalendarClock, CircleCheck, CircleDashed, Clock3, Crown, FlaskConical, Hash, Trash2 } from 'lucide-react';
import type { PaymentStatus } from '@/api/payments';
import type { Project } from '@/types/project';
import { Spinner } from '../ui';

type DashboardCardProps = {
  project: Project;
  paymentStatus?: PaymentStatus | null;
  onDelete?: (project: Project) => void;
};

const statusMap: Record<Project['status'], { label: string; tone: string; icon: typeof CircleCheck }> = {
  draft: { label: 'Draft', tone: 'bg-amber-50 text-amber-700', icon: CircleDashed },
  ready: { label: 'Generating', tone: 'bg-violet-50 text-violet-700', icon: FlaskConical },
  generated: { label: 'Generated', tone: 'bg-emerald-50 text-emerald-700', icon: CircleCheck },
};

export function DashboardCard({ project, paymentStatus = null, onDelete }: DashboardCardProps) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
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

        {paymentStatus === 'pending' || paymentStatus === 'waiting_confirmation' ? (
          <div className="inline-flex items-center gap-2 text-amber-700">
            <Clock3 className="h-4 w-4" />
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold">Pending approval</span>
          </div>
        ) : null}

        {paymentStatus === 'success' ? (
          <div className="inline-flex items-center gap-2 text-emerald-700">
            <BadgeCheck className="h-4 w-4" />
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold">Approved · Verified by admin</span>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setRedirecting(true);
            router.push(`/workspace?projectId=${project.id}`);
          }}
          className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.32)] transition hover:bg-indigo-500"
        >
          Open Workspace
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(project)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {redirecting ? (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/45">
          <div className="rounded-2xl bg-white px-5 py-4 text-center shadow-2xl">
            <Spinner size="md" className="mx-auto text-indigo-600" />
            <p className="mt-2 text-sm font-semibold text-slate-800">Mengarahkan ke workspace...</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}
