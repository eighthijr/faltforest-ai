import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import type { UpgradeReason } from './ModalProvider';

type UpgradeModalProps = {
  open: boolean;
  reason: UpgradeReason;
  onClose: () => void;
  onUpgrade: () => void;
};

const reasonText: Record<UpgradeReason, string> = {
  download: 'Download file HTML tersedia untuk akun PREMIUM.',
  chat_after_generated: 'Lanjut revisi chat setelah hasil generate tersedia untuk akun PREMIUM.',
};

export function UpgradeModal({ open, reason, onClose, onUpgrade }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-modal-in">
        <div className="inline-flex rounded-full bg-amber-100 p-2 text-amber-700">
          <AlertCircle className="size-5" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-900">Upgrade ke Premium</h3>
        <p className="mt-2 text-sm text-slate-600">{reasonText[reason]}</p>

        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-indigo-600" />
            Download tanpa batas
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-indigo-600" />
            Revisi chat setelah hasil jadi
          </li>
        </ul>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
            Nanti saja
          </button>
          <button
            type="button"
            onClick={onUpgrade}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Upgrade Now
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
