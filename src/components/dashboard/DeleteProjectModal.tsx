'use client';

import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '../ui';

type DeleteProjectModalProps = {
  open: boolean;
  projectId: string | null;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const CONFIRM_TOKEN = 'HAPUS';

export function DeleteProjectModal({ open, projectId, deleting = false, onClose, onConfirm }: DeleteProjectModalProps) {
  const [typedToken, setTypedToken] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (!open) return;
    setTypedToken('');
    setSecondsLeft(5);
  }, [open, projectId]);

  useEffect(() => {
    if (!open || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, secondsLeft]);

  const canConfirm = useMemo(() => typedToken.trim().toUpperCase() === CONFIRM_TOKEN && secondsLeft === 0 && !deleting, [deleting, secondsLeft, typedToken]);

  if (!open || !projectId) return null;

  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-slate-950/55 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">Hapus project ini?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Aksi ini tidak bisa dibatalkan. Untuk konfirmasi, ketik <span className="rounded bg-slate-100 px-1 font-semibold">{CONFIRM_TOKEN}</span>.
        </p>
        <p className="mt-2 text-xs text-slate-500">Guardrail: tombol hapus aktif setelah countdown selesai ({secondsLeft}s).</p>

        <input
          type="text"
          value={typedToken}
          onChange={(event) => setTypedToken(event.target.value)}
          placeholder={`Ketik ${CONFIRM_TOKEN}`}
          className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          autoFocus
        />

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} disabled={deleting} className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? <Spinner className="text-white" /> : null}
            Hapus Project
          </button>
        </div>
      </div>
    </div>
  );
}
