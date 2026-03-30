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
  draft: { label: 'Collecting brief', tone: 'text-amber-300' },
  ready: { label: 'Generating', tone: 'text-violet-300' },
  generated: { label: 'Ready for edits', tone: 'text-emerald-300' },
};

export function ChatHeader({ status, manualPaymentStatus = 'idle', paymentReference = '' }: ChatHeaderProps) {
  const statusMeta = statusConfig[status];
  const dashboardSidebar = useDashboardSidebar();

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#1b1d22]/95 px-4 py-3 text-white backdrop-blur-md md:px-6">
      <div className="mx-auto flex w-full max-w-4xl items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={dashboardSidebar?.toggleSidebar}
              aria-label="Toggle sidebar"
              disabled={!dashboardSidebar}
              className="h-10 w-10 rounded-2xl border border-white/15 bg-white/5 p-0 text-slate-100 transition hover:bg-white/10 lg:hidden disabled:cursor-default disabled:opacity-60"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-base font-semibold tracking-tight text-slate-100">Project Workspace</p>
              <p className="text-[11px] font-medium text-slate-400">Guided copywriting assistant</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 font-semibold ${statusMeta.tone}`}>
              <Circle className="h-3 w-3 fill-current" />
              {statusMeta.label}
            </span>
          </div>
          {manualPaymentStatus === 'waiting_admin' ? (
            <p className="mt-2 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200">
              Menunggu konfirmasi pembayaran{paymentReference ? ` (${paymentReference})` : ''}. Cek juga di Dashboard / Transactions.
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
