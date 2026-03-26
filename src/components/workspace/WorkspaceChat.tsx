'use client';

import { FormEvent, useEffect, useMemo, useReducer, useState } from 'react';
import Link from 'next/link';
import { generateCopyOnce, saveAnswersDraft } from '../../api/workspace';
import { LogoutButton } from '../auth';
import type { ProjectType } from '../../types/project';
import type { QuestionKey, WorkspaceAnswers, WorkspaceContext, WorkspaceMessage } from '../../types/workspace';
import { getMissingFields, questionLabels, questionOrder, reduceWorkspace } from '../../workspace/stateMachine';
import { PaywallModal } from './PaywallModal';

type WorkspaceChatProps = {
  projectId: string;
  projectType: ProjectType;
  projectCount?: number;
  initialState?: 'draft' | 'ready' | 'generated';
  initialGeneratedCopy?: string | null;
  onUpgradeClick?: () => void;
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
    messages: [
      {
        id: uid(),
        role: 'system',
        content: 'Halo! Saya akan tanya 4 hal dulu untuk membuat copy jualanmu.',
      },
    ],
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
  const completedCount = questionOrder.length - missingFields.length;
  const progressPercent = Math.round((completedCount / questionOrder.length) * 100);

  const submitAnswer = async (event: FormEvent) => {
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
      dispatch({ type: 'ADD_MESSAGE', value: { id: uid(), role: 'system', content: 'Copy selesai dibuat ✅' } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal generate copy.';
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
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  const handleDownload = () => {
    if (state.projectType === 'free') {
      dispatch({ type: 'SET_PAYWALL', value: 'download' });
      return;
    }

    const blob = new Blob([state.generatedCopy ?? ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `copy-${state.projectId}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-1 text-xs text-slate-500">
            <Link href="/" className="hover:underline">
              Landing
            </Link>{' '}
            /{' '}
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>{' '}
            / <span className="font-semibold text-slate-700">Workspace</span>
          </nav>
          <h1 className="text-xl font-bold text-slate-900">Workspace Chat</h1>
          <p className="text-sm text-slate-600">
            Status project: <strong>{state.state}</strong> · Project aktif: <span className="font-mono text-xs">{projectId}</span>
          </p>
          <div className="mt-2 max-w-md">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
              <span>Progress brief</span>
              <span>
                {completedCount}/{questionOrder.length} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-indigo-600 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          {projectCount > 1 && (
            <p className="text-xs text-slate-500">
              Punya {projectCount} project.{' '}
              <Link href="/dashboard" className="font-semibold text-indigo-700 hover:underline">
                Pindah project dari dashboard
              </Link>
              .
            </p>
          )}
        </div>
        <LogoutButton />
      </header>

      <div className="h-[360px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
        {state.messages.map((msg) => (
          <div key={msg.id} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {state.state === 'draft' && nextQuestion && (
          <p className="mt-3 rounded-lg bg-indigo-50 p-2 text-sm text-indigo-700">Pertanyaan berikutnya: {nextQuestion}</p>
        )}
      </div>

      {state.generatedCopy && (
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h2 className="mb-2 font-semibold text-emerald-800">Hasil Copy</h2>
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{state.generatedCopy}</pre>
        </article>
      )}

      {state.generationError && !state.generatedCopy && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <p>Generate gagal: {state.generationError}</p>
          <p className="mt-1">Klik tombol &quot;Ulangi Generate&quot; untuk mencoba lagi.</p>
        </div>
      )}

      <form onSubmit={submitAnswer} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik jawaban kamu..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
          disabled={state.loading}
        />
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white" disabled={state.loading}>
          Kirim
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={state.loading || state.state === 'generated'}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {state.loading ? 'Memproses...' : state.generationError ? 'Ulangi Generate' : 'Generate Copy'}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={state.state !== 'generated'}
          className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:opacity-60"
        >
          Download
        </button>
      </div>

      <PaywallModal
        open={Boolean(state.paywall)}
        reason={state.paywall ?? 'download'}
        onClose={() => dispatch({ type: 'SET_PAYWALL', value: null })}
        onUpgrade={() => {
          dispatch({ type: 'SET_PAYWALL', value: null });
          onUpgradeClick?.();
        }}
      />
    </section>
  );
}
