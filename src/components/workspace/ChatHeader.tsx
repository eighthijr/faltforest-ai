import Link from 'next/link';
import { ArrowLeft, ChevronRight, Circle, Download, Eraser, Sparkles } from 'lucide-react';
import { Spinner } from '../ui';
import type { WorkspaceState } from '../../types/workspace';

type ChatHeaderProps = {
  projectId: string;
  status: WorkspaceState;
  loading: boolean;
  canGenerate: boolean;
  canDownload: boolean;
  onGenerate: () => void;
  onDownload: () => void;
  onClear: () => void;
};

const statusConfig: Record<WorkspaceState, { label: string; tone: string; badge: string }> = {
  draft: {
    label: 'Collecting brief',
    tone: 'text-amber-800',
    badge: 'border-amber-200 bg-amber-50',
  },
  ready: {
    label: 'Ready to generate',
    tone: 'text-blue-800',
    badge: 'border-blue-200 bg-blue-50',
  },
  generated: {
    label: 'Generated',
    tone: 'text-emerald-800',
    badge: 'border-emerald-200 bg-emerald-50',
  },
};

export function ChatHeader({
  projectId,
  status,
  loading,
  canGenerate,
  canDownload,
  onGenerate,
  onDownload,
  onClear,
}: ChatHeaderProps) {
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

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || loading}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            {loading ? <Spinner className="text-white" /> : <Sparkles className="size-4" />}
            <span>Generate</span>
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={!canDownload}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition duration-200 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <Download className="size-4" />
            <span>Download</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex size-10 items-center justify-center rounded-full text-slate-500 transition duration-200 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear chat"
          >
            <Eraser className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
