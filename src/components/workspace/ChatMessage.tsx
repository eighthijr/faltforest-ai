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
    <article className={`flex w-full gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow-[0_2px_8px_rgba(15,23,42,0.15)]">
          <Bot className="h-4 w-4" />
        </span>
      )}
      <div
        className={`animate-chat-message max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-[0_2px_8px_rgba(15,23,42,0.12)] ${
          isUser ? 'bg-indigo-600 text-white animate-chat-message-user' : 'bg-white text-slate-800 animate-chat-message-ai'
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
            className="mt-3 inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            {cta.label}
          </button>
        ) : null}
      </div>
      {isUser && (
        <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white shadow-[0_2px_8px_rgba(15,23,42,0.15)]">
          <User className="h-4 w-4" />
        </span>
      )}
    </article>
  );
}
