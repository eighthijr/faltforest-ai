'use client';

import { FormEvent, useEffect, useMemo, useReducer, useState } from 'react';
import { generateCopyOnce, saveAnswersDraft } from '../../api/workspace';
import { useToast } from '../ui';
import type { ProjectType } from '../../types/project';
import type { QuestionKey, WorkspaceAnswers, WorkspaceContext, WorkspaceMessage } from '../../types/workspace';
import { getMissingFields, questionLabels, questionOrder, reduceWorkspace } from '../../workspace/stateMachine';
import { ChatBody } from './ChatBody';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ModalProvider, useModalManager } from './ModalProvider';
import { PreviewModal } from './PreviewModal';
import { PricingModal } from './PricingModal';
import { UpgradeModal } from './UpgradeModal';
import { PaymentModal } from './PaymentModal';
import { SuccessModal } from './SuccessModal';
import { pricingPlans, type PricingPlan } from '@/lib/pricing';
import { WorkspaceLayout } from './WorkspaceLayout';

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
  const { activeModal, closeModal, openPreview, openPricing, openUpgrade, openPayment, openSuccess } = useModalManager();
  const [input, setInput] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
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

  const missingFields = useMemo(() => getMissingFields(state), [state]);
  const nextQuestionKey = missingFields[0] as QuestionKey | undefined;
  const nextQuestion = nextQuestionKey ? questionLabels[nextQuestionKey] : null;
  const answeredCount = questionOrder.length - missingFields.length;
  const progressLabel =
    state.state === 'generated' ? 'Step 4 of 4 • Result ready' : `Step ${Math.min(answeredCount + 1, 4)} of 4 • Collecting brief`;
  const quickReplies = useMemo(() => {
    if (state.state === 'draft') {
      const templates: Record<QuestionKey, string> = {
        product: 'Produk saya adalah ...',
        target: 'Target market saya ...',
        benefit: 'Benefit utamanya ...',
        images: 'Aset gambar yang tersedia ...',
      };

      return missingFields.slice(0, 3).map((field) => templates[field]);
    }

    if (state.state === 'generated') {
      return ['Tolong perbaiki headline', 'Bikin versi lebih santai', 'Tambahkan CTA lebih kuat'];
    }

    return [];
  }, [missingFields, state.state]);

  const runAutoGeneration = async (answers: WorkspaceAnswers) => {
    try {
      dispatch({ type: 'SET_LOADING', value: true });
      dispatch({ type: 'SET_ERROR', value: null });
      dispatch({
        type: 'ADD_MESSAGE',
        value: {
          id: uid(),
          role: 'system',
          content: 'Great, I have everything I need. Generating your landing page now...',
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
    }

    setInput('');
  };

  const submitAnswer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitText(input);
  };

  const handleDownload = () => {
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
            onClearChat={() => dispatch({ type: 'CLEAR_MESSAGES', value: [initialGreeting()] })}
          />
        }
        body={
          <ChatBody
            messages={state.messages}
            helperText={helperText}
            progressLabel={progressLabel}
            isGenerating={state.loading}
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
            onQuickReply={(value) => {
              setInput(value);
              submitText(value);
            }}
            quickReplies={quickReplies}
            disabled={state.loading}
            placeholder="Type your prompt or answer..."
          />
        }
      />

      <PreviewModal
        open={activeModal.type === 'preview'}
        html={state.generatedCopy}
        onClose={closeModal}
        onDownload={handleDownload}
      />

      <UpgradeModal
        open={activeModal.type === 'upgrade'}
        reason={activeModal.type === 'upgrade' ? activeModal.reason : 'download'}
        onClose={closeModal}
        onSeePlans={() => {
          if (activeModal.type !== 'upgrade') return;
          openPricing(activeModal.reason);
        }}
      />

      <PricingModal
        open={activeModal.type === 'pricing'}
        reason={activeModal.type === 'pricing' ? activeModal.reason : 'download'}
        onClose={closeModal}
        onChoosePlan={(plan, reason) => {
          setSelectedPlan(plan);
          openPayment(reason, plan.id);
        }}
      />

      <PaymentModal
        open={activeModal.type === 'payment'}
        plan={selectedPlan ?? pricingPlans.find((plan) => plan.id === 'premium') ?? null}
        onClose={closeModal}
        processing={processingPayment}
        onPayNow={() => {
          if (activeModal.type !== 'payment') return;
          setProcessingPayment(true);
          window.setTimeout(() => {
            setProcessingPayment(false);
            setPremiumUnlocked(true);
            openSuccess(activeModal.reason, activeModal.planId);
            pushToast({ type: 'success', title: 'Payment success', description: 'Premium akses sudah aktif untuk project ini.' });
          }, 700);
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
