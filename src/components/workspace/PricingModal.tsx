import { CheckCircle2, Crown, Sparkles } from 'lucide-react';
import type { UpgradeReason } from './ModalProvider';

type PricingModalProps = {
  open: boolean;
  reason: UpgradeReason;
  onClose: () => void;
  onProceedPayment: (reason: UpgradeReason) => void;
};

const reasonLabel: Record<UpgradeReason, string> = {
  download: 'Akses download HTML project',
  chat_after_generated: 'Akses revisi chat setelah generate',
};

export function PricingModal({ open, reason, onClose, onProceedPayment }: PricingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl animate-modal-in">
        <div className="inline-flex rounded-full bg-indigo-100 p-2 text-indigo-700">
          <Sparkles className="size-5" />
        </div>
        <h3 className="mt-4 text-2xl font-semibold text-slate-900">Pilih paket untuk lanjut</h3>
        <p className="mt-2 text-sm text-slate-600">Kamu butuh premium untuk: {reasonLabel[reason]}.</p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-900">FREE</h4>
            <p className="mt-1 text-xs text-slate-500">Rp0</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4" />1 project</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4" />Generate landing page</li>
            </ul>
          </article>

          <article className="relative rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4">
            <span className="absolute -top-2 right-3 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Recommended
            </span>
            <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-900">
              <Crown className="size-4" /> PREMIUM
            </h4>
            <p className="mt-1 text-xs text-indigo-700">Rp99.000 / project</p>
            <ul className="mt-3 space-y-2 text-sm text-indigo-900">
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4" />Unlimited download</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4" />Continue chat revision</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4" />Priority support</li>
            </ul>
          </article>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
            Close
          </button>
          <button
            type="button"
            onClick={() => onProceedPayment(reason)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
