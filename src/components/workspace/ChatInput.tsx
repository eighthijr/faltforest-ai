import { FormEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { Paperclip, SendHorizonal } from 'lucide-react';

type ChatInputProps = {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  quickReplies?: string[];
  onChange: (value: string) => void;
  onQuickReply?: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChatInput({ value, disabled = false, placeholder, quickReplies = [], onChange, onQuickReply, onSubmit }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 168)}px`;
  }, [value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <footer className="sticky bottom-0 shrink-0 border-t border-slate-200 bg-white px-4 py-3 md:px-6">
      <div className="mx-auto w-full max-w-4xl">
        {quickReplies.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {quickReplies.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onQuickReply?.(suggestion)}
                className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500" aria-label="Attach file">
            <Paperclip className="h-4 w-4" />
          </button>

          <div className="flex-1 rounded-3xl bg-slate-100 px-4 py-2 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] focus-within:shadow-[inset_0_0_0_2px_rgba(79,70,229,0.5)]">
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="max-h-40 w-full resize-none overflow-y-auto bg-transparent py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            <SendHorizonal className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </footer>
  );
}
