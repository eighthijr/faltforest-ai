'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import type { WorkspaceMessage } from '@/types/workspace';

type ChatBodyProps = {
  messages: WorkspaceMessage[];
  helperText?: string | null;
  progressLabel?: string | null;
  isGenerating?: boolean;
  generatingSeconds?: number;
  onMessageAction?: (action: NonNullable<WorkspaceMessage['cta']>['action']) => void;
  imageUploadBubble?: ReactNode;
};

export function ChatBody({
  messages,
  helperText,
  progressLabel,
  isGenerating = false,
  generatingSeconds = 0,
  onMessageAction,
  imageUploadBubble,
}: ChatBodyProps) {
  const showOnboarding = messages.length <= 1;
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollAreaRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const shouldAutoScroll = distanceFromBottom < 160;
    if (!shouldAutoScroll) return;

    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isGenerating]);

  return (
    <div
      ref={scrollAreaRef}
      className="min-h-0 flex-1 overflow-y-auto bg-[#14161a] px-4 py-5 md:px-6 md:py-6"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        {showOnboarding ? (
          <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100 shadow-[0_2px_10px_rgba(30,41,59,0.35)]">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Alur chat terpandu
            </p>
            <p className="mt-1 text-xs leading-relaxed text-indigo-200/90">
              Jawab pertanyaan AI sampai brief lengkap, lalu sistem akan generate otomatis.
            </p>
          </div>
        ) : null}

        {progressLabel ? (
          <p className="self-start rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300">
            {progressLabel}
          </p>
        ) : null}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} onAction={onMessageAction} />
        ))}
        {imageUploadBubble}

        {isGenerating ? (
          <p className="inline-flex animate-pulse items-center gap-2 self-start rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-300">
            <Bot className="h-4 w-4" />AI sedang memproses brief...
          </p>
        ) : null}
        {isGenerating ? (
          <p className="self-start rounded-full bg-indigo-500/15 px-3 py-1 text-[11px] font-semibold text-indigo-200">
            Generating landing page • {Math.max(0, generatingSeconds)}s
          </p>
        ) : null}

        {helperText ? <p className="text-xs text-slate-400">{helperText}</p> : null}
        <div ref={bottomRef} aria-hidden />
      </div>
    </div>
  );
}
