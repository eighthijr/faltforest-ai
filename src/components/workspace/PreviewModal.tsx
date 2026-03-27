import { Download } from 'lucide-react';

type PreviewModalProps = {
  open: boolean;
  html: string | null;
  onClose: () => void;
  onDownload: () => void;
};

export function PreviewModal({ open, html, onClose, onDownload }: PreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-3 py-6 md:px-6" role="dialog" aria-modal="true">
      <div className="flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-5">
          <div>
            <p className="text-sm font-semibold text-slate-900">Landing page preview</p>
            <p className="text-xs text-slate-500">Review hasil generate sebelum download.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-slate-100 p-2 md:p-3">
          <iframe title="Generated landing page preview" srcDoc={html ?? ''} className="h-full w-full rounded-xl border border-slate-200 bg-white" />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-4 py-3 md:px-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Continue chatting
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            <Download className="size-3.5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
