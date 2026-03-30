import { Bot, User } from 'lucide-react';
import type { WorkspaceMessage } from '@/types/workspace';

type ChatMessageProps = {
  message: WorkspaceMessage;
  onAction?: (action: NonNullable<WorkspaceMessage['cta']>['action']) => void;
};

function parseBlocks(content: string) {
  return content.split(/```([\s\S]*?)```/g);
}

export function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const blocks = parseBlocks(message.content);
  const cta = !isUser ? message.cta : undefined;

  return (
    <article className={`flex w-full items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/70 bg-white text-indigo-600 shadow-[0_2px_6px_rgba(15,23,42,0.12)]">
          <Bot className="h-4 w-4" />
        </span>
      )}
      <div
        className={`animate-chat-message max-w-[82%] rounded-[22px] px-4 py-3.5 text-[15px] leading-relaxed shadow-[0_2px_8px_rgba(15,23,42,0.1)] ${
          isUser
            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white animate-chat-message-user'
            : 'border border-slate-200/70 bg-white text-slate-800 animate-chat-message-ai'
        }`}
      >
        {blocks.map((block, index) => {
          const isCode = index % 2 === 1;
          if (isCode) {
            return (
              <pre key={`${message.id}-code-${index}`} className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-3 font-mono text-xs text-slate-100">
                <code>{block}</code>
              </pre>
            );
          }

          return (
            <p key={`${message.id}-text-${index}`} className="whitespace-pre-wrap">
              {block}
            </p>
          );
        })}
        {cta ? (
          <button
            type="button"
            onClick={() => onAction?.(cta.action)}
            className="mt-3 inline-flex items-center rounded-full bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            {cta.label}
          </button>
        ) : null}
      </div>
      {isUser && (
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white shadow-[0_2px_6px_rgba(15,23,42,0.16)]">
          <User className="h-4 w-4" />
        </span>
      )}
    </article>
  );
}
