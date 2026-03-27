import { Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import type { WorkspaceMessage } from '../../types/workspace';

type ChatBodyProps = {
  messages: WorkspaceMessage[];
  helperText?: string | null;
};

export function ChatBody({ messages, helperText }: ChatBodyProps) {
  const showOnboarding = messages.length <= 1;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/70 to-transparent px-4 py-4 md:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 md:gap-4">
        {showOnboarding ? (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-900">
            <p className="flex items-center gap-2 font-semibold">
              <Sparkles className="size-4" />
              Mulai cepat dalam 2 menit
            </p>
            <p className="mt-1 text-xs text-indigo-700">
              Isi jawaban singkat dan langsung generate. Kamu bisa revisi copy kapan pun setelah draft jadi.
            </p>
          </div>
        ) : null}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {helperText ? (
          <p className="animate-chat-message self-start rounded-xl border border-slate-300/90 bg-white/80 px-3 py-2 text-xs text-slate-600">
            {helperText}
          </p>
        ) : null}
      </div>
    </div>
  );
}
