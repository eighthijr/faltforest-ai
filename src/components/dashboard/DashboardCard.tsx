'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BadgeCheck, CircleCheck, CircleDashed, Clock3, Crown, FlaskConical, Trash2 } from 'lucide-react';
import type { PaymentStatus } from '@/api/payments';
import type { Project } from '@/types/project';
import { Spinner } from '../ui';

type DashboardCardProps = {
  project: Project;
  paymentStatus?: PaymentStatus | null;
  onDelete?: (project: Project) => void;
};

const statusMap: Record<Project['status'], { label: string; tone: string; icon: typeof CircleCheck }> = {
  draft: { label: 'Draft', tone: 'bg-amber-100 text-amber-700', icon: CircleDashed },
  ready: { label: 'Diproses', tone: 'bg-violet-100 text-violet-700', icon: FlaskConical },
  generated: { label: 'Live', tone: 'bg-emerald-100 text-emerald-700', icon: CircleCheck },
};

export function DashboardCard({ project, paymentStatus = null, onDelete }: DashboardCardProps) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const createdDate = new Date(project.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' });
  const status = statusMap[project.status];
  const StatusIcon = status.icon;
  const isWaitingConfirmation = paymentStatus === 'pending' || paymentStatus === 'waiting_confirmation';
  const projectTypeBadge = isWaitingConfirmation
    ? {
        label: 'Waiting Confirmation',
        tone: 'border-amber-200 bg-amber-50 text-amber-700',
      }
    : project.type === 'premium'
      ? {
          label: 'Premium',
          tone: 'border-violet-200 bg-violet-50 text-violet-700',
        }
      : {
          label: 'Free',
          tone: 'border-slate-200 bg-white text-slate-700',
        };

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] shadow-sm ${projectTypeBadge.tone}`}>
          <Crown className="h-3.5 w-3.5" />
          {projectTypeBadge.label}
        </span>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/support"
            className="inline-flex items-center rounded-full bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
          >
            Hubungi CS
          </Link>
          <button
            type="button"
            onClick={() => onDelete?.(project)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Hapus project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/40">
        {project.generated_html ? (
          <div className="relative h-44 bg-slate-100">
            <iframe
              srcDoc={project.generated_html}
              title={`Preview ${project.id}`}
              className="pointer-events-none absolute left-1/2 top-0 h-[720px] w-[1280px] -translate-x-1/2 origin-top scale-[0.34] border-0 bg-white"
              sandbox=""
            />
          </div>
        ) : (
          <div className="p-4">
            <h3 className="line-clamp-3 text-center text-3xl font-extrabold leading-tight tracking-tight text-slate-900">
              Proyek Landing Page Siap Pakai untuk Bisnis Kamu
            </h3>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-2xl font-bold uppercase tracking-tight text-slate-900">{project.id.slice(0, 8)}</p>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${status.tone}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500">Dibuat {createdDate}</p>

        {isWaitingConfirmation ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Clock3 className="h-3.5 w-3.5" />
            Menunggu persetujuan
          </div>
        ) : null}

        {paymentStatus === 'success' ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            Pembayaran terverifikasi
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setRedirecting(true);
            router.push(`/dashboard/workspace?projectId=${project.id}`);
          }}
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-[0_8px_18px_rgba(79,70,229,0.32)] transition hover:bg-indigo-500"
        >
          Buka Workspace
        </button>
        <button
          type="button"
          onClick={() => {
            setRedirecting(true);
            router.push(`/dashboard/workspace?projectId=${project.id}`);
          }}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          aria-label="Buka workspace cepat"
        >
          <span className="text-lg leading-none">↗</span>
        </button>
      </div>

      {redirecting ? (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/45">
          <div className="rounded-2xl bg-white px-5 py-4 text-center shadow-2xl">
            <Spinner size="md" className="mx-auto text-indigo-600" />
            <p className="mt-2 text-sm font-semibold text-slate-800">Sedang membuka ruang kerja...</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}
