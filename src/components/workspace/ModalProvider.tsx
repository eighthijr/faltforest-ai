'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export type UpgradeReason = 'download' | 'chat_after_generated';

export type ActiveModal =
  | { type: null }
  | { type: 'preview' }
  | { type: 'upgrade'; reason: UpgradeReason }
  | { type: 'pricing'; reason: UpgradeReason };

type ModalContextValue = {
  activeModal: ActiveModal;
  closeModal: () => void;
  openPreview: () => void;
  openUpgrade: (reason: UpgradeReason) => void;
  openPricing: (reason: UpgradeReason) => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ActiveModal>({ type: null });

  const closeModal = useCallback(() => {
    setActiveModal({ type: null });
  }, []);

  const openPreview = useCallback(() => {
    setActiveModal({ type: 'preview' });
  }, []);

  const openUpgrade = useCallback((reason: UpgradeReason) => {
    setActiveModal({ type: 'upgrade', reason });
  }, []);

  const openPricing = useCallback((reason: UpgradeReason) => {
    setActiveModal({ type: 'pricing', reason });
  }, []);

  const value = useMemo(
    () => ({ activeModal, closeModal, openPreview, openUpgrade, openPricing }),
    [activeModal, closeModal, openPreview, openUpgrade, openPricing],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModalManager() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalManager must be used within ModalProvider.');
  }

  return context;
}
