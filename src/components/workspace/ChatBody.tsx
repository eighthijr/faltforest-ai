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
    <div ref={scrollAreaRef} className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-4 md:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        {showOnboarding ? (
          <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800 shadow-[0_2px_8px_rgba(99,102,241,0.14)]">
            <p className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4" />
              Alur chat terpandu
            </p>
            <p className="mt-1 text-xs text-indigo-700">Jawab pertanyaan AI sampai brief lengkap, lalu sistem akan generate otomatis.</p>
          </div>
        ) : null}

        {progressLabel ? (
          <p className="self-start rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-[0_1px_3px_rgba(15,23,42,0.12)]">{progressLabel}</p>
        ) : null}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} onAction={onMessageAction} />
        ))}
        {imageUploadBubble}

        {isGenerating ? (
          <p className="inline-flex animate-pulse items-center gap-2 self-start rounded-2xl bg-white px-3 py-2 text-xs text-slate-600 shadow-[0_1px_4px_rgba(15,23,42,0.12)]">
            <Bot className="h-4 w-4" />AI sedang memproses brief...
          </p>
        ) : null}
        {isGenerating ? (
          <p className="self-start rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
            Generating landing page • {Math.max(0, generatingSeconds)}s
          </p>
        ) : null}

        {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
        <div ref={bottomRef} aria-hidden />
      </div>
    </div>
  );
}
