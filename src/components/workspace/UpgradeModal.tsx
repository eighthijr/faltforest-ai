import { AlertCircle, ArrowRight } from 'lucide-react';
import type { UpgradeReason } from './ModalProvider';
import { ModalShell } from './ModalShell';

type UpgradeModalProps = {
  open: boolean;
  reason: UpgradeReason;
  onClose: () => void;
  onSeePlans: () => void;
};

const reasonText: Record<UpgradeReason, string> = {
  download: 'Download file HTML tersedia untuk akun PREMIUM.',
  chat_after_generated: 'Lanjut revisi chat setelah generate tersedia untuk akun PREMIUM.',
};

export function UpgradeModal({ open, reason, onClose, onSeePlans }: UpgradeModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="Upgrade ke Premium" size="md">
      <div className="inline-flex rounded-full bg-amber-100 p-2 text-amber-700">
        <AlertCircle className="size-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">Upgrade ke Premium</h3>
      <p className="mt-2 text-sm text-slate-600">{reasonText[reason]}</p>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Nanti saja
        </button>
        <button
          type="button"
          onClick={onSeePlans}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          See Plans
          <ArrowRight className="size-4" />
        </button>
      </div>
    </ModalShell>
  );
}
