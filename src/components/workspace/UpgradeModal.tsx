import { ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { premiumPlan } from '@/lib/pricing';
import type { UpgradeReason } from './ModalProvider';
import { ModalShell } from './ModalShell';

type UpgradeModalProps = {
  open: boolean;
  reason: UpgradeReason;
  onClose: () => void;
  onUpgradeNow: () => void;
};

const reasonText: Record<UpgradeReason, string> = {
  download: 'Buka Premium untuk mengunduh landing page yang sudah kamu generate secara instan.',
  chat_after_generated: 'Buka Premium untuk lanjut mengedit lewat chat setelah generate selesai.',
};

export function UpgradeModal({ open, reason, onClose, onUpgradeNow }: UpgradeModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="Upgrade ke Premium" size="md">
      <div className="inline-flex rounded-full bg-amber-100 p-2 text-amber-700">
        <Lock className="size-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">Upgrade ke Premium</h3>
      <p className="mt-2 text-sm text-slate-600">{reasonText[reason]}</p>

      <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-xs uppercase tracking-wide text-indigo-700">Paket Premium</p>
        <p className="mt-1 text-base font-semibold text-indigo-900">{premiumPlan.name}</p>
        <p className="text-sm text-indigo-800">{premiumPlan.priceLabel}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-indigo-900">
          {premiumPlan.features.map((feature) => (
            <li key={feature} className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Nanti dulu
        </button>
        <button
          type="button"
          onClick={onUpgradeNow}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Upgrade sekarang
          <ArrowRight className="size-4" />
        </button>
      </div>
    </ModalShell>
  );
}
