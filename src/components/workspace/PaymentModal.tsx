import { CheckCircle2, Clock3, ImagePlus, LayoutTemplate } from 'lucide-react';
import { pricingPlans } from '@/lib/pricing';
import type { PaymentMethod } from './ModalProvider';
import { ModalShell } from './ModalShell';

type PaymentModalProps = {
  open: boolean;
  method: PaymentMethod;
  onClose: () => void;
  onMarkPaid: () => void;
  processing?: boolean;
};

const premiumPlan = pricingPlans.find((plan) => plan.id === 'premium');

function paymentMethodTitle(method: PaymentMethod) {
  return method === 'tripay_qris_auto' ? 'QRIS Tripay (Auto)' : 'QRIS Static (Manual)';
}

export function PaymentModal({ open, method, onClose, onMarkPaid, processing = false }: PaymentModalProps) {
  const isAuto = method === 'tripay_qris_auto';

  return (
    <ModalShell open={open} onClose={onClose} title="Payment" size="md" closeOnBackdrop={false}>
      <div className="inline-flex rounded-full bg-indigo-100 p-2 text-indigo-700">
        <LayoutTemplate className="size-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">Complete payment</h3>
      <p className="mt-1 text-sm text-slate-600">{paymentMethodTitle(method)}</p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Premium amount</p>
        <p className="mt-1 text-base font-semibold text-slate-900">{premiumPlan?.priceLabel ?? '-'}</p>
      </div>

      <div className="mt-4 grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-4">
        <div className="h-44 w-44 rounded-xl bg-slate-100" aria-label="QRIS code placeholder" />
      </div>

      {isAuto ? (
        <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <Clock3 className="size-4" />
            Waiting for payment
          </p>
          <p className="mt-1 text-xs text-indigo-700">Automatic verification is active. Payment will be checked instantly.</p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Instructions</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600">
            <li>Transfer using QRIS above.</li>
            <li>Upload proof of payment after transfer.</li>
            <li>Status will change after admin verification.</li>
          </ul>
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-amber-700">
            <Clock3 className="size-3.5" />
            Waiting for admin verification
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} disabled={processing} className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
          Cancel
        </button>
        <button
          type="button"
          onClick={onMarkPaid}
          disabled={processing}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAuto ? <CheckCircle2 className="size-4" /> : <ImagePlus className="size-4" />}
          {processing ? 'Checking...' : isAuto ? 'I have paid' : 'Upload Proof / Confirm'}
        </button>
      </div>
    </ModalShell>
  );
}
