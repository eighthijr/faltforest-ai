import { CreditCard } from 'lucide-react';
import type { PricingPlan } from '@/lib/pricing';
import { ModalShell } from './ModalShell';

type PaymentModalProps = {
  open: boolean;
  plan: PricingPlan | null;
  onClose: () => void;
  onPayNow: () => void;
  processing?: boolean;
};

export function PaymentModal({ open, plan, onClose, onPayNow, processing = false }: PaymentModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="Payment" size="md" closeOnBackdrop={false}>
      <div className="inline-flex rounded-full bg-indigo-100 p-2 text-indigo-700">
        <CreditCard className="size-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">Payment</h3>
      <p className="mt-2 text-sm text-slate-600">Konfirmasi plan dan lanjutkan pembayaran.</p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Selected plan</p>
        <p className="mt-1 text-base font-semibold text-slate-900">{plan?.name ?? 'PREMIUM'}</p>
        <p className="text-sm text-slate-600">{plan?.priceLabel ?? '-'}</p>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block text-sm text-slate-700">
          Cardholder name
          <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="John Doe" />
        </label>
        <label className="block text-sm text-slate-700">
          Card number
          <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="4242 4242 4242 4242" />
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} disabled={processing} className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
          Cancel
        </button>
        <button
          type="button"
          onClick={onPayNow}
          disabled={processing}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </ModalShell>
  );
}
