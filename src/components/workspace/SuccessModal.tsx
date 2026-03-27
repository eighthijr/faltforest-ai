import { CheckCircle2 } from 'lucide-react';
import { ModalShell } from './ModalShell';

type SuccessModalProps = {
  open: boolean;
  onClose: () => void;
  onContinueWorkspace: () => void;
  onDownloadNow: () => void;
};

export function SuccessModal({ open, onClose, onContinueWorkspace, onDownloadNow }: SuccessModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="Payment Success" size="md">
      <div className="inline-flex rounded-full bg-emerald-100 p-2 text-emerald-700">
        <CheckCircle2 className="size-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">Pembayaran berhasil</h3>
      <p className="mt-2 text-sm text-slate-600">Project kamu sudah aktif untuk fitur premium. Lanjutkan workflow kamu sekarang.</p>

      <div className="mt-6 grid gap-2">
        <button type="button" onClick={onContinueWorkspace} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Continue to Workspace
        </button>
        <button type="button" onClick={onDownloadNow} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          Download Now
        </button>
      </div>
    </ModalShell>
  );
}
