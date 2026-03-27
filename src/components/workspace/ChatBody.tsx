import { Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import type { WorkspaceMessage } from '../../types/workspace';

type ChatBodyProps = {
  messages: WorkspaceMessage[];
  helperText?: string | null;
  progressLabel?: string | null;
  isGenerating?: boolean;
  onMessageAction?: (action: NonNullable<WorkspaceMessage['cta']>['action']) => void;
};

export function ChatBody({ messages, helperText, progressLabel, isGenerating = false, onMessageAction }: ChatBodyProps) {
  const showOnboarding = messages.length <= 1;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/70 to-transparent px-4 py-4 md:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 md:gap-4">
        {showOnboarding ? (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-900">
            <p className="flex items-center gap-2 font-semibold">
              <Sparkles className="size-4" />
              Guided workspace experience
            </p>
            <p className="mt-1 text-xs text-indigo-700">
              Cukup jawab chat langkah demi langkah. AI akan lanjut otomatis sampai preview siap.
            </p>
          </div>
        ) : null}

        {progressLabel ? (
          <p className="self-start rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {progressLabel}
          </p>
        ) : null}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} onAction={onMessageAction} />
        ))}

        {isGenerating ? (
          <p className="animate-chat-message self-start rounded-xl border border-slate-300/90 bg-white/80 px-3 py-2 text-xs text-slate-600">
            AI sedang menyusun landing page kamu...
          </p>
        ) : null}

        {helperText ? (
          <p className="animate-chat-message self-start rounded-xl border border-slate-300/90 bg-white/80 px-3 py-2 text-xs text-slate-600">
            {helperText}
          </p>
        ) : null}
      </div>
    </div>
  );
}
