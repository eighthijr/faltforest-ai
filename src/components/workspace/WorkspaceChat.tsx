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
import { PaywallModal } from './PaywallModal';
import { WorkspaceLayout } from './WorkspaceLayout';

type WorkspaceChatProps = {
  projectId: string;
  projectType: ProjectType;
  projectCount?: number;
  initialState?: 'draft' | 'ready' | 'generated';
  initialGeneratedCopy?: string | null;
  onUpgradeClick?: (reason: 'download' | 'chat_after_generated') => void;
};

type LocalState = WorkspaceContext & {
  loading: boolean;
  paywall: null | 'download' | 'chat_after_generated';
  generationError: string | null;
  messages: WorkspaceMessage[];
};

type LocalAction =
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'SET_PAYWALL'; value: LocalState['paywall'] }
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
  content: 'Halo! Saya akan tanya 4 hal dulu untuk membuat landing page siap pakai buat jualanmu.',
});

function reducer(state: LocalState, action: LocalAction): LocalState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_PAYWALL':
      return { ...state, paywall: action.value };
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

export function WorkspaceChat({
  projectId,
  projectType,
  projectCount = 1,
  initialState = 'draft',
  initialGeneratedCopy = null,
  onUpgradeClick,
}: WorkspaceChatProps) {
  const { pushToast } = useToast();
  const [input, setInput] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [state, dispatch] = useReducer(reducer, {
    projectId,
    projectType,
    state: initialState,
    answers: emptyAnswers,
    generatedCopy: initialGeneratedCopy,
    hasGeneratedOnce: initialState === 'generated',
    loading: false,
    paywall: null,
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

  const submitAnswer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    if (state.state === 'generated' && state.projectType === 'free') {
      dispatch({ type: 'SET_PAYWALL', value: 'chat_after_generated' });
      return;
    }

    dispatch({ type: 'ADD_MESSAGE', value: { id: uid(), role: 'user', content: input.trim() } });

    if (state.state === 'draft') {
      const key = nextQuestionKey;
      if (!key) return;

      dispatch({ type: 'APPLY_EVENT', event: { type: 'ANSWER_SUBMITTED', key, value: input.trim() } });

      const currentMissing = questionOrder.filter((question) => {
        if (question === key) return false;
        return !state.answers[question]?.trim();
      });

      if (currentMissing.length > 0) {
        dispatch({
          type: 'ADD_MESSAGE',
          value: { id: uid(), role: 'system', content: questionLabels[currentMissing[0]] },
        });
      }
    }

    setInput('');
  };

  const handleGenerate = async () => {
    const missing = getMissingFields(state);
    if (missing.length > 0) {
      dispatch({
        type: 'ADD_MESSAGE',
        value: { id: uid(), role: 'system', content: `Data belum lengkap: ${missing.join(', ')}` },
      });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', value: true });
      dispatch({ type: 'SET_ERROR', value: null });
      await saveAnswersDraft({ projectId: state.projectId, answers: state.answers });
      dispatch({ type: 'APPLY_EVENT', event: { type: 'COLLECTION_COMPLETED' } });

      const copy = await generateCopyOnce({ projectId: state.projectId, answers: state.answers });
      dispatch({ type: 'APPLY_EVENT', event: { type: 'GENERATION_SUCCEEDED', copy } });
      dispatch({ type: 'ADD_MESSAGE', value: { id: uid(), role: 'system', content: 'Landing page selesai dibuat ✅' } });
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
          content: errorMessage,
        },
      });
      pushToast({ type: 'error', title: 'Generate gagal', description: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  const handleDownload = () => {
    if (state.projectType === 'free') {
      dispatch({ type: 'SET_PAYWALL', value: 'download' });
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

  const handleClear = () => {
    dispatch({ type: 'CLEAR_MESSAGES', value: [initialGreeting()] });
    pushToast({ type: 'success', title: 'Chat dibersihkan', description: 'Riwayat percakapan telah dihapus.' });
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
            loading={state.loading}
            canGenerate={state.state !== 'generated'}
            canDownload={state.state === 'generated'}
            onGenerate={handleGenerate}
            onDownload={handleDownload}
            onClear={handleClear}
          />
        }
        body={<ChatBody messages={state.messages} helperText={helperText} />}
        input={
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={submitAnswer}
            disabled={state.loading}
            placeholder="Ketik jawaban kamu..."
          />
        }
      />

      <PaywallModal
        open={Boolean(state.paywall)}
        reason={state.paywall ?? 'download'}
        onClose={() => dispatch({ type: 'SET_PAYWALL', value: null })}
        onUpgrade={() => {
          const reason = state.paywall ?? 'download';
          dispatch({ type: 'SET_PAYWALL', value: null });
          onUpgradeClick?.(reason);
        }}
      />
    </>
  );
}
