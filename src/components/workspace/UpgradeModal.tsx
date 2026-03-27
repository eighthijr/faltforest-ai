import { ArrowRight, ShieldCheck } from 'lucide-react';
import { pricingPlans } from '@/lib/pricing';
import type { UpgradeReason } from './ModalProvider';
import { ModalShell } from './ModalShell';

type UpgradeModalProps = {
  open: boolean;
  reason: UpgradeReason;
  onClose: () => void;
  onUpgradeNow: () => void;
};

const reasonText: Record<UpgradeReason, string> = {
  download: 'Unlock Premium to download your generated landing page instantly.',
  chat_after_generated: 'Unlock Premium to continue editing via chat after generation.',
};

const premiumPlan = pricingPlans.find((plan) => plan.id === 'premium');

export function UpgradeModal({ open, reason, onClose, onUpgradeNow }: UpgradeModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="Upgrade to Premium" size="md">
      <div className="inline-flex rounded-full bg-amber-100 p-2 text-amber-700">
        <ShieldCheck className="size-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">Upgrade to Premium</h3>
      <p className="mt-2 text-sm text-slate-600">{reasonText[reason]}</p>

      <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-xs uppercase tracking-wide text-indigo-700">Premium plan</p>
        <p className="mt-1 text-base font-semibold text-indigo-900">{premiumPlan?.name ?? 'Premium'}</p>
        <p className="text-sm text-indigo-800">{premiumPlan?.priceLabel ?? 'Contact support for pricing'}</p>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Maybe later
        </button>
        <button
          type="button"
          onClick={onUpgradeNow}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Upgrade Now
          <ArrowRight className="size-4" />
        </button>
      </div>
    </ModalShell>
  );
}
