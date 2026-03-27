import { FormEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { SendHorizonal } from 'lucide-react';

type ChatInputProps = {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  quickReplies?: string[];
  onChange: (value: string) => void;
  onQuickReply?: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChatInput({
  value,
  disabled = false,
  placeholder,
  quickReplies = [],
  onChange,
  onQuickReply,
  onSubmit,
}: ChatInputProps) {
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
      const form = event.currentTarget.form;
      form?.requestSubmit();
    }
  };

  return (
    <footer className="shrink-0 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur md:px-6 md:py-4">
      <div className="mx-auto w-full max-w-3xl">
        {quickReplies.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {quickReplies.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onQuickReply?.(suggestion)}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex w-full items-end gap-2 md:gap-3">
          <div className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition duration-200 hover:border-slate-400 focus-within:border-indigo-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.18)]">
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="max-h-40 w-full resize-none overflow-y-auto bg-transparent py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white transition duration-200 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizonal className="size-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </footer>
  );
}
