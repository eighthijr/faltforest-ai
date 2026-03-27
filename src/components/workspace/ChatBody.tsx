import { ChatMessage } from './ChatMessage';
import type { WorkspaceMessage } from '../../types/workspace';

type ChatBodyProps = {
  messages: WorkspaceMessage[];
  helperText?: string | null;
};

export function ChatBody({ messages, helperText }: ChatBodyProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/45 px-4 py-4 md:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:gap-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {helperText ? (
          <p className="self-start rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
            {helperText}
          </p>
        ) : null}
      </div>
    </div>
  );
}
