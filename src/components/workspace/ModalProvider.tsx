'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export type UpgradeReason = 'download' | 'chat_after_generated';
export type PaymentMethod = 'tripay_qris_auto' | 'qris_static_manual';

export type ActiveModal =
  | { type: null }
  | { type: 'preview' }
  | { type: 'upgrade'; reason: UpgradeReason }
  | { type: 'payment-method'; reason: UpgradeReason }
  | { type: 'payment'; reason: UpgradeReason; method: PaymentMethod }
  | { type: 'success'; reason: UpgradeReason; method: PaymentMethod };

type ModalContextValue = {
  activeModal: ActiveModal;
  closeModal: () => void;
  openPreview: () => void;
  openUpgrade: (reason: UpgradeReason) => void;
  openPaymentMethod: (reason: UpgradeReason) => void;
  openPayment: (reason: UpgradeReason, method: PaymentMethod) => void;
  openSuccess: (reason: UpgradeReason, method: PaymentMethod) => void;
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

  const openPaymentMethod = useCallback((reason: UpgradeReason) => {
    setActiveModal({ type: 'payment-method', reason });
  }, []);

  const openPayment = useCallback((reason: UpgradeReason, method: PaymentMethod) => {
    setActiveModal({ type: 'payment', reason, method });
  }, []);

  const openSuccess = useCallback((reason: UpgradeReason, method: PaymentMethod) => {
    setActiveModal({ type: 'success', reason, method });
  }, []);

  const value = useMemo(
    () => ({ activeModal, closeModal, openPreview, openUpgrade, openPaymentMethod, openPayment, openSuccess }),
    [activeModal, closeModal, openPreview, openUpgrade, openPaymentMethod, openPayment, openSuccess],
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
