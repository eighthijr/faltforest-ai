import Link from 'next/link';
import { ArrowLeft, ChevronRight, Circle, Download, Eraser, Settings2, Sparkles } from 'lucide-react';
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

const statusConfig: Record<WorkspaceState, { label: string; tone: string }> = {
  draft: { label: 'Collecting brief', tone: 'text-amber-700' },
  ready: { label: 'Ready to generate', tone: 'text-blue-700' },
  generated: { label: 'Generated', tone: 'text-emerald-700' },
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

  return (
    <header className="z-10 shrink-0 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.08)] backdrop-blur md:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
            <Link href="/dashboard" className="font-medium transition hover:text-indigo-600">
              Dashboard
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-slate-700">Workspace</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="truncate text-sm font-semibold text-slate-900 transition hover:text-indigo-600 md:text-base"
              title="Back to dashboard"
            >
              Project {projectId}
            </Link>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusMeta.tone}`}>
              <Circle className="size-3 fill-current" />
              {statusMeta.label}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition duration-200 hover:bg-slate-100 md:text-sm"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || loading}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition duration-200 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            {loading ? <Spinner className="text-white" /> : <Sparkles className="size-4" />}
            <span className="hidden sm:inline">Generate</span>
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={!canDownload}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex size-10 items-center justify-center rounded-full text-slate-500 transition duration-200 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear chat"
          >
            <Eraser className="size-5" />
          </button>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full text-slate-500 transition duration-200 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Settings"
          >
            <Settings2 className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
