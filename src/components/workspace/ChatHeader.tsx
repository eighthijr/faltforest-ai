import { Circle, Settings2, Trash2 } from 'lucide-react';
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
  const shortProjectId = projectId.length > 16 ? `${projectId.slice(0, 6)}...${projectId.slice(-6)}` : projectId;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Project Workspace</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1 font-mono">{shortProjectId}</span>
            <span className={`inline-flex items-center gap-1.5 font-semibold ${statusMeta.tone}`}>
              <Circle className="h-3 w-3 fill-current" />
              {statusMeta.label}
            </span>
          </div>
          {manualPaymentStatus === 'waiting_admin' ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
              Menunggu konfirmasi pembayaran{paymentReference ? ` (${paymentReference})` : ''}. Cek juga di Dashboard / Transactions.
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <Settings2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClearChat}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
