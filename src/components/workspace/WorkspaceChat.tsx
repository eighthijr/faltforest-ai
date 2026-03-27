'use client';

import { FormEvent, useEffect, useMemo, useReducer, useState } from 'react';
import Link from 'next/link';
import { generateCopyOnce, saveAnswersDraft } from '../../api/workspace';
import { LogoutButton } from '../auth';
import { Spinner, useToast } from '../ui';
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

const quickNav = ['Overview', 'Messages', 'Preview', 'Deploy'];

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
    messages: [
      {
        id: uid(),
        role: 'system',
        content: 'Halo! Saya akan tanya 4 hal dulu untuk membuat landing page siap pakai buat jualanmu.',
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

  return (
    <section className="material-dark-page mx-auto min-h-screen w-full max-w-[1440px] p-3 text-slate-100 md:p-6">
      <div className="grid gap-4 2xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="material-dark-surface hidden p-4 2xl:block">
          <div className="mb-5 border-b border-slate-800 pb-4">
            <p className="text-sm font-semibold text-white">Workspace</p>
            <p className="text-xs text-slate-400">Project Builder</p>
          </div>
          <div className="space-y-1">
            {quickNav.map((item) => (
              <button
                key={item}
                type="button"
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  item === 'Messages' ? 'bg-slate-800 font-semibold text-white' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <header className="material-dark-surface p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <nav aria-label="Breadcrumb" className="mb-1 text-xs text-slate-500">
                  <Link href="/" className="hover:text-slate-300">
                    Landing
                  </Link>{' '}
                  /{' '}
                  <Link href="/dashboard" className="hover:text-slate-300">
                    Dashboard
                  </Link>{' '}
                  / <span className="font-semibold text-slate-300">Workspace</span>
                </nav>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Landing Page Workspace</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Status project: <strong className="text-slate-200">{state.state}</strong> · Project aktif:{' '}
                  <span className="font-mono text-xs text-slate-300">{projectId}</span>
                </p>
                <div className="mt-3 max-w-md">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Progress brief</span>
                    <span>
                      {completedCount}/{questionOrder.length} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
                {projectCount > 1 && (
                  <p className="mt-2 text-xs text-slate-500">
                    Punya {projectCount} project.{' '}
                    <Link href="/dashboard" className="font-semibold text-indigo-300 hover:text-indigo-200">
                      Pindah project dari dashboard
                    </Link>
                    .
                  </p>
                )}
              </div>
              <LogoutButton />
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <article className="material-dark-surface p-3 md:p-4">
              <h2 className="mb-3 text-sm font-medium text-slate-300">Assistant Chat</h2>
              <div className="h-[420px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
                {state.messages.map((msg) => (
                  <div key={msg.id} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-indigo-500 text-white shadow-[0_8px_20px_rgba(79,70,229,0.35)]'
                          : 'border border-slate-800 bg-slate-900 text-slate-300'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {state.state === 'draft' && nextQuestion && (
                  <p className="mt-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2 text-sm text-indigo-200">
                    Pertanyaan berikutnya: {nextQuestion}
                  </p>
                )}
              </div>

              <form onSubmit={submitAnswer} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik jawaban kamu..."
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                  disabled={state.loading}
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
                  disabled={state.loading}
                >
                  Kirim
                </button>
              </form>
            </article>

            <article className="material-dark-surface p-4">
              <h2 className="text-sm font-medium text-slate-300">Actions</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={state.loading || state.state === 'generated'}
                  className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {state.loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner className="text-white" />
                      Memproses...
                    </span>
                  ) : state.generationError ? (
                    'Ulangi Generate'
                  ) : (
                    'Generate Landing Page'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={state.state !== 'generated'}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 disabled:opacity-50"
                >
                  Download
                </button>
              </div>

              {state.generationError && !state.generatedCopy && (
                <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
                  <p>Generate landing page gagal: {state.generationError}</p>
                  <p className="mt-1">Klik tombol &quot;Ulangi Generate&quot; untuk mencoba lagi.</p>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-400">
                <p className="font-medium text-slate-300">Workflow hint</p>
                <p className="mt-1">Isi 4 pertanyaan sampai progress 100%, lalu klik Generate. Untuk project free, fitur premium akan memunculkan paywall.</p>
              </div>
            </article>
          </div>

          {state.generatedCopy && (
            <article className="material-dark-surface p-4">
              <h2 className="mb-3 font-medium text-slate-100">Preview Landing Page</h2>
              <iframe
                title="Landing page preview"
                className="h-[560px] w-full rounded-xl border border-slate-800 bg-white"
                srcDoc={state.generatedCopy}
                sandbox="allow-same-origin"
              />
            </article>
          )}
        </div>
      </div>

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
    </section>
  );
}
