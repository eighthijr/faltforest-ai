import Link from 'next/link';
import { ArrowLeft, ChevronRight, Circle } from 'lucide-react';
import type { WorkspaceState } from '../../types/workspace';

type ChatHeaderProps = {
  projectId: string;
  status: WorkspaceState;
};

const statusConfig: Record<WorkspaceState, { label: string; tone: string; badge: string }> = {
  draft: {
    label: 'Collecting brief',
    tone: 'text-amber-800',
    badge: 'border-amber-200 bg-amber-50',
  },
  ready: {
    label: 'Generating',
    tone: 'text-violet-800',
    badge: 'border-violet-200 bg-violet-50',
  },
  generated: {
    label: 'Ready',
    tone: 'text-emerald-800',
    badge: 'border-emerald-200 bg-emerald-50',
  },
};

export function ChatHeader({ projectId, status }: ChatHeaderProps) {
  const statusMeta = statusConfig[status];
  const shortProjectId = projectId.length > 18 ? `${projectId.slice(0, 8)}...${projectId.slice(-6)}` : projectId;

  return (
    <header className="z-10 shrink-0 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.08)] backdrop-blur md:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500 md:mb-0.5">
            <Link href="/dashboard" className="font-medium transition hover:text-indigo-600 hover:underline">
              Dashboard
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-slate-700">Workspace</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-700"
              title="Back to dashboard"
            >
              <ArrowLeft className="size-3.5" />
              Back to Dashboard
            </Link>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600">
              {shortProjectId}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusMeta.tone} ${statusMeta.badge}`}
            >
              <Circle className="size-3 fill-current" />
              {statusMeta.label}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
