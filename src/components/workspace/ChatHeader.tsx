import { Circle, Menu, Trash2 } from 'lucide-react';
import { useDashboardSidebar } from '@/components/dashboard/DashboardSidebarContext';
import type { WorkspaceState } from '@/types/workspace';

type ManualPaymentStatus = 'idle' | 'waiting_payment' | 'waiting_admin' | 'approved';

type ChatHeaderProps = {
  projectId: string;
  status: WorkspaceState;
  manualPaymentStatus?: ManualPaymentStatus;
  paymentReference?: string;
  onClearChat?: () => void;
};

const statusConfig: Record<WorkspaceState, { label: string; tone: string }> = {
  draft: { label: 'AI collecting brief', tone: 'text-amber-700' },
  ready: { label: 'AI generating result', tone: 'text-violet-700' },
  generated: { label: 'AI ready for edits', tone: 'text-emerald-700' },
};

export function ChatHeader({ projectId, status, manualPaymentStatus = 'idle', paymentReference = '', onClearChat }: ChatHeaderProps) {
  const statusMeta = statusConfig[status];
  const dashboardSidebar = useDashboardSidebar();
  const shortProjectId = projectId.length > 16 ? `${projectId.slice(0, 6)}...${projectId.slice(-6)}` : projectId;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/85 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="mx-auto flex w-full max-w-4xl items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {dashboardSidebar ? (
              <button
                type="button"
                onClick={dashboardSidebar.toggleSidebar}
                aria-label="Toggle sidebar"
                className="material-btn-outline h-10 w-10 rounded-2xl p-0 text-slate-700 lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
            ) : null}
            <div>
              <p className="text-base font-semibold tracking-tight text-slate-900">Project Workspace</p>
              <p className="text-[11px] font-medium text-slate-500">Guided copywriting assistant</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex max-w-full items-center rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-600">
              {shortProjectId}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-semibold shadow-[0_1px_3px_rgba(15,23,42,0.1)] ${statusMeta.tone}`}>
              <Circle className="h-3 w-3 fill-current" />
              {statusMeta.label}
            </span>
          </div>
          {manualPaymentStatus === 'waiting_admin' ? (
            <p className="mt-2 rounded-xl border border-amber-200/70 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
              Menunggu konfirmasi pembayaran{paymentReference ? ` (${paymentReference})` : ''}. Cek juga di Dashboard / Transactions.
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={onClearChat}
            aria-label="Reset chat"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
