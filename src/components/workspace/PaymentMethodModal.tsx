import { FileUp, Lock, Zap } from 'lucide-react';
import type { PaymentMethod, UpgradeReason } from './ModalProvider';
import { ModalShell } from './ModalShell';

type PaymentMethodState = 'active' | 'disabled';

type PaymentMethodOption = {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  description: string;
  state: PaymentMethodState;
  badge: string;
};

type PaymentMethodModalProps = {
  open: boolean;
  reason: UpgradeReason;
  selectedMethod: PaymentMethod;
  onClose: () => void;
  onSelectMethod: (method: PaymentMethod, reason: UpgradeReason) => void;
};

const paymentOptions: PaymentMethodOption[] = [
  {
    id: 'tripay_qris_auto',
    title: 'QRIS Tripay (OTOMATIS)',
    subtitle: 'Verifikasi otomatis',
    description: 'Verifikasi berlangsung instan setelah pembayaran. Saat ini belum tersedia.',
    state: 'disabled',
    badge: 'Segera Hadir',
  },
  {
    id: 'qris_static_manual',
    title: 'QRIS Statis (MANUAL)',
    subtitle: 'Verifikasi manual',
    description: 'Unggah bukti transfer setelah bayar. Diverifikasi oleh admin.',
    state: 'active',
    badge: 'Aktif',
  },
];

export function PaymentMethodModal({ open, reason, selectedMethod, onClose, onSelectMethod }: PaymentMethodModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="Pilih metode pembayaran" size="md">
      <p className="text-sm font-semibold text-slate-900">Pilih metode pembayaran</p>
      <p className="mt-1 text-sm text-slate-600">Pilih metode yang tersedia. Gateway otomatis sedang dinonaktifkan sementara.</p>

      <div className="mt-5 space-y-3">
        {paymentOptions.map((option) => {
          const disabled = option.state === 'disabled';
          const selected = selectedMethod === option.id;
          const Icon = option.id === 'tripay_qris_auto' ? Zap : FileUp;

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMethod(option.id, reason)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                disabled
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100/80 opacity-60'
                  : selected
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 inline-flex rounded-xl p-2 ${disabled ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-700'}`}>
                  {disabled ? <Lock className="size-4" /> : <Icon className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{option.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${disabled ? 'bg-slate-300 text-slate-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {option.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-700">{option.subtitle}</p>
                  <p className="mt-1 text-xs text-slate-600">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">Jaminan: pembayaran manual akan diverifikasi admin sebelum Premium diaktifkan.</p>

      <div className="mt-6">
        <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Kembali
        </button>
      </div>
    </ModalShell>
  );
}
