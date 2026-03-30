'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';
import { ToastContainer, toast, type ToastOptions } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info';

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

function ToastContent({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 text-xs opacity-90">{description}</p>}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const pushToast = useCallback((input: ToastInput) => {
    const options: ToastOptions = {
      autoClose: input.durationMs ?? 2800,
    };

    const content = <ToastContent title={input.title} description={input.description} />;

    if (input.type === 'success') {
      toast.success(content, options);
      return;
    }

    if (input.type === 'error') {
      toast.error(content, options);
      return;
    }

    toast.info(content, options);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        position="top-right"
        closeOnClick
        newestOnTop
        theme="colored"
        toastClassName="rounded-xl border p-3 shadow-sm"
        bodyClassName="p-0"
      />
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
