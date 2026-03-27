import { CheckCircle2, Sparkles } from 'lucide-react';
import { pricingPlans, type PricingPlan } from '@/lib/pricing';
import type { UpgradeReason } from './ModalProvider';
import { ModalShell } from './ModalShell';

type PricingModalProps = {
  open: boolean;
  reason: UpgradeReason;
  onClose: () => void;
  onChoosePlan: (plan: PricingPlan, reason: UpgradeReason) => void;
};

const reasonLabel: Record<UpgradeReason, string> = {
  download: 'Akses download HTML project',
  chat_after_generated: 'Akses revisi chat setelah generate',
};

export function PricingModal({ open, reason, onClose, onChoosePlan }: PricingModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="Pricing" size="lg">
      <div className="inline-flex rounded-full bg-indigo-100 p-2 text-indigo-700">
        <Sparkles className="size-5" />
      </div>
      <h3 className="mt-4 text-2xl font-semibold text-slate-900">Pilih paket untuk lanjut</h3>
      <p className="mt-2 text-sm text-slate-600">Kamu butuh premium untuk: {reasonLabel[reason]}.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {pricingPlans.map((plan) => (
          <article
            key={plan.id}
            className={`relative rounded-2xl p-4 ${
              plan.recommended ? 'border-2 border-indigo-300 bg-indigo-50' : 'border border-slate-200 bg-white'
            }`}
          >
            {plan.recommended && (
              <span className="absolute -top-2 right-3 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Recommended
              </span>
            )}
            <h4 className={`text-sm font-semibold ${plan.recommended ? 'text-indigo-900' : 'text-slate-900'}`}>{plan.name}</h4>
            <p className={`mt-1 text-xs ${plan.recommended ? 'text-indigo-700' : 'text-slate-500'}`}>{plan.priceLabel}</p>
            <p className={`mt-2 text-xs ${plan.recommended ? 'text-indigo-700' : 'text-slate-600'}`}>{plan.description}</p>
            <ul className={`mt-3 space-y-2 text-sm ${plan.recommended ? 'text-indigo-900' : 'text-slate-600'}`}>
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onChoosePlan(plan, reason)}
              className={`mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
                plan.id === 'premium'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {plan.ctaLabel}
            </button>
          </article>
        ))}
      </div>

      <div className="mt-6">
        <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Close
        </button>
      </div>
    </ModalShell>
  );
}
