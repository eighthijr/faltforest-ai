'use client';

import { FormEvent, useEffect, useMemo, useReducer, useState } from 'react';
import { confirmManualAlreadyPaid, fetchManualQrisImageUrl, listPaymentHistory, submitManualPaymentProof } from '@/api/payments';
import { generateCopyOnce, generateRevisionCopy, saveAnswersDraft } from '../../api/workspace';
import { useToast } from '../ui';
import type { ProjectType } from '../../types/project';
import type { QuestionKey, WorkspaceAnswers, WorkspaceContext, WorkspaceMessage } from '../../types/workspace';
import { getMissingFields, questionLabels, questionOrder, reduceWorkspace } from '../../workspace/stateMachine';
import { ChatBody } from './ChatBody';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ModalProvider, useModalManager } from './ModalProvider';
import { PreviewModal } from './PreviewModal';
import { PaymentMethodModal } from './PaymentMethodModal';
import { UpgradeModal } from './UpgradeModal';
import { PaymentModal } from './PaymentModal';
import { SuccessModal } from './SuccessModal';
import { WorkspaceLayout } from './WorkspaceLayout';

const PREMIUM_AMOUNT = 99000;

type ManualPaymentStatus = 'idle' | 'waiting_payment' | 'waiting_admin' | 'approved';

type WorkspaceChatProps = {
  projectId: string;
  projectType: ProjectType;
  projectCount?: number;
  initialState?: 'draft' | 'ready' | 'generated';
  initialGeneratedCopy?: string | null;
};

type LocalState = WorkspaceContext & {
  loading: boolean;
  generationError: string | null;
  messages: WorkspaceMessage[];
};

type LocalAction =
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'SET_ERROR'; value: string | null }
  | { type: 'ADD_MESSAGE'; value: WorkspaceMessage }
  | { type: 'CLEAR_MESSAGES'; value: WorkspaceMessage[] }
  | { type: 'RESTORE_SNAPSHOT'; value: Pick<LocalState, 'state' | 'answers' | 'generatedCopy' | 'messages'> }
  | { type: 'APPLY_EVENT'; event: Parameters<typeof reduceWorkspace>[1] };

function uid() {
  return crypto.randomUUID();
}

function storageKey(projectId: string) {
  return `workspace-session:${projectId}`;
}

function isWorkspaceState(value: unknown): value is WorkspaceContext['state'] {
  return value === 'draft' || value === 'ready' || value === 'generated';
}

function createManualReference(projectId: string) {
  return `MNL-${Date.now()}-${projectId.slice(0, 6)}`;
}

const emptyAnswers: WorkspaceAnswers = {
  product: '',
  target: '',
  benefit: '',
  images: '',
};

const initialGreeting = (): WorkspaceMessage => ({
  id: uid(),
  role: 'system',
  content:
    'Halo! 👋 Saya akan pandu kamu langkah demi langkah. Cukup balas chat ini, nanti saya generate otomatis saat data cukup.\n\nStep 1: Apa produk yang kamu jual?',
});

function reducer(state: LocalState, action: LocalAction): LocalState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_ERROR':
      return { ...state, generationError: action.value };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.value] };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: action.value };
    case 'RESTORE_SNAPSHOT':
      return {
        ...state,
        state: action.value.state,
        answers: action.value.answers,
        generatedCopy: action.value.generatedCopy,
        hasGeneratedOnce: action.value.state === 'generated',
        messages: action.value.messages.length > 0 ? action.value.messages : state.messages,
      };
    case 'APPLY_EVENT':
      return { ...state, ...reduceWorkspace(state, action.event) };
    default:
      return state;
  }
}

export function WorkspaceChat(props: WorkspaceChatProps) {
  return (
    <ModalProvider>
      <WorkspaceChatContent {...props} />
    </ModalProvider>
  );
}

function WorkspaceChatContent({
  projectId,
  projectType,
  projectCount = 1,
  initialState = 'draft',
  initialGeneratedCopy = null,
}: WorkspaceChatProps) {
  const { pushToast } = useToast();
  const { activeModal, closeModal, openPreview, openPaymentMethod, openUpgrade, openPayment, openSuccess } = useModalManager();
  const [input, setInput] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'tripay_qris_auto' | 'qris_static_manual'>('qris_static_manual');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [premiumUnlocked, setPremiumUnlocked] = useState(projectType === 'premium');
  const [manualPaymentStatus, setManualPaymentStatus] = useState<ManualPaymentStatus>('waiting_payment');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [qrisImageUrl, setQrisImageUrl] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [generatingSeconds, setGeneratingSeconds] = useState(0);
  const [state, dispatch] = useReducer(reducer, {
    projectId,
    projectType,
    state: initialState,
    answers: emptyAnswers,
    generatedCopy: initialGeneratedCopy,
    hasGeneratedOnce: initialState === 'generated',
    loading: false,
    generationError: null,
    messages: [initialGreeting()],
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(storageKey(projectId));
    if (!raw) {
      setHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<LocalState>;
      const snapshotState = isWorkspaceState(parsed.state) ? parsed.state : initialState;
      const snapshotAnswers: WorkspaceAnswers = {
        ...emptyAnswers,
        ...(parsed.answers ?? {}),
      };
      const snapshotMessages = Array.isArray(parsed.messages)
        ? parsed.messages.filter((message): message is WorkspaceMessage => {
            return Boolean(
              message &&
                typeof message.id === 'string' &&
                typeof message.content === 'string' &&
                (message.role === 'system' || message.role === 'user'),
            );
          })
        : [];

      dispatch({
        type: 'RESTORE_SNAPSHOT',
        value: {
          state: snapshotState,
          answers: snapshotAnswers,
          generatedCopy: parsed.generatedCopy ?? initialGeneratedCopy,
          messages: snapshotMessages,
        },
      });
    } catch {
      window.localStorage.removeItem(storageKey(projectId));
    } finally {
      setHydrated(true);
    }
  }, [projectId, initialGeneratedCopy, initialState]);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(
      storageKey(projectId),
      JSON.stringify({
        projectId: state.projectId,
        state: state.state,
        answers: state.answers,
        generatedCopy: state.generatedCopy,
        messages: state.messages,
      }),
    );
  }, [hydrated, projectId, state]);

  useEffect(() => {
    let mounted = true;

    const syncPaymentState = async () => {
      try {
        const payments = await listPaymentHistory();
        const projectPayments = payments.filter((payment) => payment.project_id === projectId);
        const latest = projectPayments[0];

        if (!latest || !mounted) return;

        if (latest.status === 'success') {
          setPremiumUnlocked(true);
          setManualPaymentStatus('approved');
          return;
        }

        if (latest.gateway === 'manual_qris' && (latest.status === 'pending' || latest.status === 'waiting_confirmation')) {
          setManualPaymentStatus('waiting_admin');
          setPaymentReference(latest.reference);
        }
      } catch {
        // no-op
      }
    };

    void syncPaymentState();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (activeModal.type !== 'payment' || activeModal.method !== 'qris_static_manual') return;

    let mounted = true;
    const loadQris = async () => {
      try {
        const url = await fetchManualQrisImageUrl();
        if (mounted) setQrisImageUrl(url);
      } catch {
        if (mounted) setQrisImageUrl('');
      }
    };

    void loadQris();

    return () => {
      mounted = false;
    };
  }, [activeModal]);

  useEffect(() => {
    if (!paymentReference || manualPaymentStatus !== 'waiting_admin' || premiumUnlocked) return;

    const timer = window.setInterval(async () => {
      try {
        const payments = await listPaymentHistory();
        const matchedPayment = payments.find((payment) => payment.reference === paymentReference);

        if (!matchedPayment) return;

        if (matchedPayment.status === 'success') {
          setPremiumUnlocked(true);
          setManualPaymentStatus('approved');
          window.clearInterval(timer);
          openSuccess('download', 'qris_static_manual');
          pushToast({ type: 'success', title: 'Upgrade berhasil', description: 'Pembayaran disetujui admin. Premium sudah aktif.' });
          return;
        }

        if (matchedPayment.status === 'rejected') {
          setManualPaymentStatus('waiting_payment');
          setPaymentReference('');
          window.clearInterval(timer);
          pushToast({ type: 'error', title: 'Pembayaran ditolak', description: 'Silakan upload ulang bukti pembayaran yang valid.' });
        }
      } catch {
        // no-op
      }
    }, 8000);

    return () => {
      window.clearInterval(timer);
    };
  }, [manualPaymentStatus, openSuccess, paymentReference, premiumUnlocked, pushToast]);

  useEffect(() => {
    if (!state.loading) {
      setGeneratingSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setGeneratingSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [state.loading]);

  const missingFields = useMemo(() => getMissingFields(state), [state]);
  const nextQuestionKey = missingFields[0] as QuestionKey | undefined;
  const nextQuestion = nextQuestionKey ? questionLabels[nextQuestionKey] : null;
  const answeredCount = questionOrder.length - missingFields.length;
  const progressLabel =
    state.state === 'generated' ? 'Step 4 dari 4 • Hasil siap' : `Step ${Math.min(answeredCount + 1, 4)} dari 4 • Mengumpulkan brief`;
  const runAutoGeneration = async (answers: WorkspaceAnswers) => {
    try {
      dispatch({ type: 'SET_LOADING', value: true });
      dispatch({ type: 'SET_ERROR', value: null });
      dispatch({
        type: 'ADD_MESSAGE',
        value: {
          id: uid(),
          role: 'system',
          content: 'Siap, datanya sudah lengkap. Sekarang saya generate landing page kamu...',
        },
      });

      await saveAnswersDraft({ projectId: state.projectId, answers });
      dispatch({ type: 'APPLY_EVENT', event: { type: 'COLLECTION_COMPLETED' } });

      const copy = await generateCopyOnce({ projectId: state.projectId, answers });
      dispatch({ type: 'APPLY_EVENT', event: { type: 'GENERATION_SUCCEEDED', copy } });
      dispatch({
        type: 'ADD_MESSAGE',
        value: {
          id: uid(),
          role: 'system',
          content: 'Landing page selesai dibuat ✅\nRingkasan: struktur hero, benefit, CTA, dan social proof sudah disusun.',
          cta: { label: 'Preview Result', action: 'preview' },
        },
      });
      pushToast({ type: 'success', title: 'Generate berhasil', description: 'Landing page draft sudah siap.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal generate landing page.';
      dispatch({ type: 'APPLY_EVENT', event: { type: 'GENERATION_FAILED' } });
      dispatch({ type: 'SET_ERROR', value: errorMessage });
      dispatch({
        type: 'ADD_MESSAGE',
        value: {
          id: uid(),
          role: 'system',
          content: `Proses generate gagal. ${errorMessage}`,
        },
      });
      pushToast({ type: 'error', title: 'Generate gagal', description: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  const submitText = (rawValue: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return;

    if (state.state === 'generated' && state.projectType === 'free' && !premiumUnlocked) {
      openUpgrade('chat_after_generated');
      return;
    }

    dispatch({ type: 'ADD_MESSAGE', value: { id: uid(), role: 'user', content: trimmed } });

    if (state.state === 'draft') {
      const key = nextQuestionKey;
      if (!key) return;

      dispatch({ type: 'APPLY_EVENT', event: { type: 'ANSWER_SUBMITTED', key, value: trimmed } });
      const updatedAnswers: WorkspaceAnswers = {
        ...state.answers,
        [key]: trimmed,
      };

      const currentMissing = questionOrder.filter((question) => {
        if (question === key) return false;
        return !updatedAnswers[question]?.trim();
      });

      if (currentMissing.length > 0) {
        dispatch({
          type: 'ADD_MESSAGE',
          value: {
            id: uid(),
            role: 'system',
            content: `Step ${answeredCount + 1} selesai. ${questionLabels[currentMissing[0]]}`,
          },
        });
      } else {
        void runAutoGeneration(updatedAnswers);
      }
      setInput('');
      return;
    }

    if (state.state === 'generated') {
      if (!premiumUnlocked) {
        openUpgrade('chat_after_generated');
        return;
      }

      void (async () => {
        try {
          dispatch({ type: 'SET_LOADING', value: true });
          dispatch({
            type: 'ADD_MESSAGE',
            value: {
              id: uid(),
              role: 'system',
              content: 'Permintaan revisi diterima. AI sedang menyusun versi terbaru...',
            },
          });

          const revisedCopy = await generateRevisionCopy({
            projectId: state.projectId,
            answers: {
              ...state.answers,
              benefit: `${state.answers.benefit}\nRevisi user premium: ${trimmed}`,
            },
          });

          dispatch({ type: 'APPLY_EVENT', event: { type: 'GENERATION_SUCCEEDED', copy: revisedCopy } });
          dispatch({
            type: 'ADD_MESSAGE',
            value: {
              id: uid(),
              role: 'system',
              content: 'Revisi premium selesai ✅ Preview sudah diperbarui dengan versi terbaru.',
              cta: { label: 'Preview Result', action: 'preview' },
            },
          });
          pushToast({ type: 'success', title: 'Revisi selesai', description: 'Versi landing page terbaru siap dipreview.' });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Gagal memproses revisi premium.';
          dispatch({
            type: 'ADD_MESSAGE',
            value: {
              id: uid(),
              role: 'system',
              content: `Revisi gagal diproses. ${errorMessage}`,
            },
          });
          pushToast({ type: 'error', title: 'Revisi gagal', description: errorMessage });
        } finally {
          dispatch({ type: 'SET_LOADING', value: false });
        }
      })();
      setInput('');
      return;
    }

    setInput('');
  };

  const submitAnswer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitText(input);
  };

  const handleDownload = () => {
    if (manualPaymentStatus === 'waiting_admin') {
      pushToast({
        type: 'info',
        title: 'Menunggu verifikasi admin',
        description: 'Download akan aktif setelah pembayaran premium disetujui.',
      });
      return;
    }

    if (state.projectType === 'free' && !premiumUnlocked) {
      openUpgrade('download');
      return;
    }

    const blob = new Blob([state.generatedCopy ?? ''], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `landing-page-${state.projectId}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const helperText =
    state.state === 'draft' && nextQuestion
      ? `Pertanyaan berikutnya: ${nextQuestion}`
      : state.state === 'generated' && !premiumUnlocked
        ? 'Mode revisi dan chat lanjutan dikunci untuk user free. Upgrade premium untuk membuka fitur ini.'
      : projectCount > 1
        ? `Kamu punya ${projectCount} project. Pindah project bisa dilakukan dari Dashboard.`
        : null;

  return (
    <>
      <WorkspaceLayout
        header={
          <ChatHeader
            projectId={projectId}
            status={state.state}
            manualPaymentStatus={manualPaymentStatus}
            paymentReference={paymentReference}
            onClearChat={() => dispatch({ type: 'CLEAR_MESSAGES', value: [initialGreeting()] })}
          />
        }
        body={
          <ChatBody
            messages={state.messages}
            helperText={helperText}
            progressLabel={progressLabel}
            isGenerating={state.loading}
            generatingSeconds={generatingSeconds}
            onMessageAction={(action) => {
              if (action === 'preview') openPreview();
            }}
          />
        }
        input={
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={submitAnswer}
            disabled={state.loading}
            loading={state.loading}
            locked={state.state === 'generated' && !premiumUnlocked}
            waitingConfirmation={manualPaymentStatus === 'waiting_admin'}
            onLockedClick={() => openUpgrade('chat_after_generated')}
            placeholder={
              state.state === 'generated' && !premiumUnlocked
                ? 'Upgrade premium untuk chat revisi'
                : manualPaymentStatus === 'waiting_admin'
                  ? 'Menunggu konfirmasi pembayaran premium...'
                  : 'Type your prompt or answer...'
            }
          />
        }
      />

      <PreviewModal
        open={activeModal.type === 'preview'}
        html={state.generatedCopy}
        onClose={closeModal}
        onDownload={handleDownload}
        downloadDisabled={manualPaymentStatus === 'waiting_admin'}
        downloadLocked={state.projectType === 'free' && !premiumUnlocked}
      />

      <UpgradeModal
        open={activeModal.type === 'upgrade'}
        reason={activeModal.type === 'upgrade' ? activeModal.reason : 'download'}
        onClose={closeModal}
        onUpgradeNow={() => {
          if (activeModal.type !== 'upgrade') return;
          openPaymentMethod(activeModal.reason);
        }}
      />

      <PaymentMethodModal
        open={activeModal.type === 'payment-method'}
        reason={activeModal.type === 'payment-method' ? activeModal.reason : 'download'}
        selectedMethod={selectedPaymentMethod}
        onClose={closeModal}
        onSelectMethod={(method, reason) => {
          if (method === 'tripay_qris_auto') return;
          setSelectedPaymentMethod(method);
          openPayment(reason, method);
        }}
      />

      <PaymentModal
        open={activeModal.type === 'payment'}
        method={activeModal.type === 'payment' ? activeModal.method : selectedPaymentMethod}
        onClose={closeModal}
        processing={processingPayment}
        manualStatus={manualPaymentStatus}
        qrisImageUrl={qrisImageUrl}
        proofFile={proofFile}
        onProofFileChange={setProofFile}
        onConfirmPayment={async () => {
          if (activeModal.type !== 'payment' || activeModal.method !== 'qris_static_manual') return;
          if (manualPaymentStatus === 'waiting_admin' || manualPaymentStatus === 'approved') return;

          setProcessingPayment(true);

          try {
            const reference = createManualReference(projectId);

            if (proofFile) {
              const result = await submitManualPaymentProof({ projectId, file: proofFile });
              setPaymentReference(result.reference);
            } else {
              await confirmManualAlreadyPaid({
                projectId,
                amount: PREMIUM_AMOUNT,
                reference,
              });
              setPaymentReference(reference);
            }

            setManualPaymentStatus('waiting_admin');
            pushToast({
              type: 'info',
              title: 'Menunggu persetujuan',
              description: 'Pembayaran kamu sedang menunggu verifikasi admin.',
            });
            closeModal();
          } catch (error) {
            pushToast({
              type: 'error',
              title: 'Konfirmasi pembayaran gagal',
              description: error instanceof Error ? error.message : 'Silakan coba lagi.',
            });
          } finally {
            setProcessingPayment(false);
          }
        }}
      />

      <SuccessModal
        open={activeModal.type === 'success'}
        onClose={closeModal}
        onContinueWorkspace={closeModal}
        onDownloadNow={() => {
          closeModal();
          handleDownload();
        }}
      />
    </>
  );
}
