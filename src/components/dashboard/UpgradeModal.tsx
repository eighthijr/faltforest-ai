type UpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export function UpgradeModal({ open, onClose, onUpgrade }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-bold text-slate-900">Upgrade ke PREMIUM</h3>
        <p className="mt-2 text-slate-600">
          Kamu sudah memakai jatah 1 project FREE. Upgrade sekarang untuk membuat project lebih banyak.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
          >
            Nanti Dulu
          </button>
          <button
            type="button"
            onClick={onUpgrade}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white"
          >
            Upgrade Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
