'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
};

type ToastInput = {
  title: string;
  description?: string;
  type?: ToastType;
  durationMs?: number;
};

type ToastContextValue = {
  pushToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function getToastStyle(type: ToastType) {
  if (type === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  if (type === 'error') return 'border-rose-200 bg-rose-50 text-rose-900';
  return 'border-slate-200 bg-white text-slate-900';
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const nextToast: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        type: input.type ?? 'info',
      };
      setToasts((current) => [...current, nextToast]);

      const duration = input.durationMs ?? 2800;
      window.setTimeout(() => removeToast(id), duration);
    },
    [removeToast],
  );

  const value = useMemo<ToastContextValue>(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[1000] flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((toast) => (
          <article
            key={toast.id}
            className={`pointer-events-auto rounded-xl border p-3 shadow-sm transition-all duration-200 animate-toast-in ${getToastStyle(
              toast.type,
            )}`}
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description && <p className="mt-1 text-xs opacity-90">{toast.description}</p>}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="mt-2 text-xs font-medium underline underline-offset-2"
            >
              Tutup
            </button>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
