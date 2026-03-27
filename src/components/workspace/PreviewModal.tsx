import { Download, Lock } from 'lucide-react';
import { ModalShell } from './ModalShell';

type PreviewModalProps = {
  open: boolean;
  html: string | null;
  onClose: () => void;
  onDownload: () => void;
  downloadDisabled?: boolean;
  downloadLocked?: boolean;
};

export function PreviewModal({ open, html, onClose, onDownload, downloadDisabled = false, downloadLocked = false }: PreviewModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="Landing page preview" size="xl">
      <div className="-m-6 flex h-full max-h-[94vh] min-h-[78vh] flex-col overflow-hidden rounded-3xl bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-base font-semibold text-slate-900">Landing page preview</p>
            <p className="text-xs text-slate-500">Review hasil generate sebelum download.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50">
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-slate-100 p-2 md:p-3">
          {html ? (
            <iframe
              title="Generated landing page preview"
              srcDoc={html}
              sandbox="allow-same-origin"
              className="h-full w-full rounded-2xl border border-slate-200 bg-white"
            />
          ) : (
            <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              Preview belum tersedia. Selesaikan generate dulu untuk melihat hasil landing page.
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Continue chatting
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={downloadDisabled}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadLocked ? <Lock className="size-4" /> : <Download className="size-4" />}
            {downloadDisabled ? 'Menunggu approval admin' : downloadLocked ? 'Upgrade untuk download' : 'Download'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
