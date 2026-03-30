import { ChangeEvent } from 'react';
import { CheckCircle2, Clock3, FileUp, LoaderCircle, ShieldCheck, Zap } from 'lucide-react';
import { premiumPlan } from '@/lib/pricing';
import type { PaymentMethod } from './ModalProvider';
import { ModalShell } from './ModalShell';

type ManualPaymentStatus = 'idle' | 'waiting_payment' | 'waiting_admin' | 'approved';

type PaymentModalProps = {
  open: boolean;
  method: PaymentMethod;
  onClose: () => void;
  onConfirmPayment: () => void;
  processing?: boolean;
  manualStatus: ManualPaymentStatus;
  qrisImageUrl: string;
  proofFile: File | null;
  onProofFileChange: (file: File | null) => void;
};

function statusBadge(status: ManualPaymentStatus) {
  if (status === 'approved') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="size-3.5" />Disetujui</span>;
  }

  if (status === 'waiting_admin') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700"><Clock3 className="size-3.5" />Menunggu persetujuan</span>;
  }

  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700"><Clock3 className="size-3.5" />Menunggu pembayaran</span>;
}

export function PaymentModal({
  open,
  method,
  onClose,
  onConfirmPayment,
  processing = false,
  manualStatus,
  qrisImageUrl,
  proofFile,
  onProofFileChange,
}: PaymentModalProps) {
  const isAuto = method === 'tripay_qris_auto';

  return (
    <ModalShell open={open} onClose={onClose} title="Pembayaran" size="md" closeOnBackdrop={false}>
      <h3 className="text-xl font-semibold text-slate-900">Selesaikan pembayaran</h3>
      <p className="mt-1 text-sm text-slate-600">{isAuto ? 'QRIS Tripay (OTOMATIS)' : 'QRIS Statis (MANUAL)'}</p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Nominal premium</p>
        <p className="mt-1 text-base font-semibold text-slate-900">{premiumPlan.priceLabel}</p>
      </div>

      {isAuto ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-100 p-4 opacity-60">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Zap className="size-4" />
            Verifikasi otomatis belum tersedia
          </p>
          <p className="mt-1 text-xs text-slate-600">Tripay sedang dinonaktifkan. Silakan gunakan QRIS Statis (Manual).</p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-4">
            {qrisImageUrl ? (
              <img src={qrisImageUrl} alt="QRIS manual" className="h-52 w-52 rounded-xl border border-slate-200 object-cover" />
            ) : (
              <div className="grid h-52 w-52 place-items-center rounded-xl bg-slate-100 text-xs text-slate-500">Gambar QRIS belum tersedia</div>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Panduan</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600">
              <li>Pindai QR dan selesaikan pembayaran.</li>
              <li>Unggah bukti transfer (opsional, tapi disarankan).</li>
              <li>Admin akan memverifikasi pembayaran sebelum Premium aktif.</li>
            </ul>
            <div className="mt-3 flex items-center justify-between gap-2">
              {statusBadge(manualStatus)}
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600"><ShieldCheck className="size-3.5" />Terverifikasi admin</span>
            </div>
          </div>

          <label className="mt-4 block rounded-2xl border border-slate-200 bg-white p-3">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-800"><FileUp className="size-4" />Unggah bukti pembayaran (opsional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event: ChangeEvent<HTMLInputElement>) => onProofFileChange(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-xs text-slate-600"
            />
            {proofFile && <p className="mt-1 text-xs text-slate-500">Dipilih: {proofFile.name}</p>}
          </label>
        </>
      )}

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} disabled={processing} className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
          Batal
        </button>
        <button
          type="button"
          onClick={onConfirmPayment}
          disabled={processing || isAuto}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {processing ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          {processing ? 'Mengirim...' : 'Saya sudah bayar'}
        </button>
      </div>
    </ModalShell>
  );
}
