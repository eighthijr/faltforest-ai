import { Bot, UserCircle2 } from 'lucide-react';
import type { WorkspaceMessage } from '../../types/workspace';

type ChatMessageProps = {
  message: WorkspaceMessage;
};

function parseBlocks(content: string) {
  return content.split(/```([\s\S]*?)```/g);
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const blocks = parseBlocks(message.content);

  return (
    <article className={`flex w-full gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
          <Bot className="size-4" />
        </span>
      )}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-[0_1px_2px_rgba(15,23,42,0.05)] ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'border border-slate-200/80 bg-slate-50 text-slate-700'
        }`}
      >
        {blocks.map((block, index) => {
          const isCode = index % 2 === 1;
          if (isCode) {
            return (
              <pre
                key={`${message.id}-code-${index}`}
                className="mt-2 overflow-x-auto rounded-xl bg-slate-900/95 p-3 font-mono text-xs text-slate-100"
              >
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
      </div>
      {isUser && (
        <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
          <UserCircle2 className="size-4" />
        </span>
      )}
    </article>
  );
}
