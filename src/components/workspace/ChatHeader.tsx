import { Circle, Menu } from 'lucide-react';
import { useDashboardSidebar } from '@/components/dashboard/DashboardSidebarContext';
import type { WorkspaceState } from '@/types/workspace';

type ManualPaymentStatus = 'idle' | 'waiting_payment' | 'waiting_admin' | 'approved';

type ChatHeaderProps = {
  status: WorkspaceState;
  manualPaymentStatus?: ManualPaymentStatus;
  paymentReference?: string;
};

const statusConfig: Record<WorkspaceState, { label: string; tone: string }> = {
  draft: { label: 'AI collecting brief', tone: 'text-amber-700' },
  ready: { label: 'AI generating result', tone: 'text-violet-700' },
  generated: { label: 'AI ready for edits', tone: 'text-emerald-700' },
};

export function ChatHeader({ status, manualPaymentStatus = 'idle', paymentReference = '' }: ChatHeaderProps) {
  const statusMeta = statusConfig[status];
  const dashboardSidebar = useDashboardSidebar();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/85 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="mx-auto flex w-full max-w-4xl items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={dashboardSidebar?.toggleSidebar}
              aria-label="Toggle sidebar"
              disabled={!dashboardSidebar}
              className="material-btn-outline h-10 w-10 rounded-2xl p-0 text-slate-700 lg:hidden disabled:cursor-default disabled:opacity-60"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-base font-semibold tracking-tight text-slate-900">Project Workspace</p>
              <p className="text-[11px] font-medium text-slate-500">Guided copywriting assistant</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
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
      </div>
    </header>
  );
}
