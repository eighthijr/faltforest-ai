import { BadgeCheck, ImagePlus, Zap } from 'lucide-react';
import type { PaymentMethod, UpgradeReason } from './ModalProvider';
import { ModalShell } from './ModalShell';

type PaymentMethodModalProps = {
  open: boolean;
  reason: UpgradeReason;
  selectedMethod: PaymentMethod;
  onClose: () => void;
  onSelectMethod: (method: PaymentMethod, reason: UpgradeReason) => void;
};

export function PaymentMethodModal({
  open,
  reason,
  selectedMethod,
  onClose,
  onSelectMethod,
}: PaymentMethodModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="Choose payment method" size="md">
      <p className="text-sm font-semibold text-slate-900">Choose payment method</p>
      <p className="mt-1 text-sm text-slate-600">Upgrade to Premium and continue with one of these QRIS options.</p>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={() => onSelectMethod('tripay_qris_auto', reason)}
          className={`w-full rounded-2xl border p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/60 ${
            selectedMethod === 'tripay_qris_auto' ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex rounded-xl bg-indigo-100 p-2 text-indigo-700">
              <Zap className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">QRIS Tripay (Auto)</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  <BadgeCheck className="size-3.5" />
                  Recommended
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-indigo-700">Automatic verification</p>
              <p className="mt-1 text-xs text-slate-600">Payment will be confirmed instantly.</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectMethod('qris_static_manual', reason)}
          className={`w-full rounded-2xl border p-4 text-left transition hover:border-slate-300 hover:bg-slate-50 ${
            selectedMethod === 'qris_static_manual' ? 'border-slate-400 bg-slate-50' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex rounded-xl bg-slate-100 p-2 text-slate-700">
              <ImagePlus className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">QRIS Static (Manual)</p>
              <p className="mt-1 text-xs font-medium text-slate-700">Manual verification</p>
              <p className="mt-1 text-xs text-slate-600">Upload proof after payment.</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6">
        <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Back
        </button>
      </div>
    </ModalShell>
  );
}
