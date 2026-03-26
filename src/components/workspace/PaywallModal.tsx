type PaywallModalProps = {
  open: boolean;
  reason: 'download' | 'chat_after_generated';
  onClose: () => void;
  onUpgrade: () => void;
};

const reasonText: Record<PaywallModalProps['reason'], string> = {
  download: 'Download hanya untuk akun PREMIUM.',
  chat_after_generated: 'Lanjut chat setelah hasil jadi hanya untuk akun PREMIUM.',
};

export function PaywallModal({ open, reason, onClose, onUpgrade }: PaywallModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-bold text-slate-900">Upgrade ke PREMIUM</h3>
        <p className="mt-2 text-slate-600">{reasonText[reason]}</p>
        <p className="mt-1 text-sm text-slate-500">Klik upgrade untuk lihat detail paket dan lanjut ke pembayaran.</p>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-300 px-4 py-2">
            Tutup
          </button>
          <button
            type="button"
            onClick={onUpgrade}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white"
          >
            Lihat Paket Premium
          </button>
        </div>
      </div>
    </div>
  );
}
