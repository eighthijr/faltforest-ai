import { FormEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { Paperclip, SendHorizonal } from 'lucide-react';
import { Spinner } from '../ui';

type ChatInputProps = {
  value: string;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChatInput({ value, disabled = false, loading = false, placeholder, onChange, onSubmit }: ChatInputProps) {
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
    <footer className="sticky bottom-0 shrink-0 border-t border-slate-200 bg-white px-3 py-2 md:px-6 md:py-3">
      <div className="mx-auto w-full max-w-4xl">
        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <button type="button" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 md:h-11 md:w-11" aria-label="Attach file">
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
              className="max-h-32 w-full resize-none overflow-y-auto bg-transparent py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 md:max-h-40"
            />
          </div>

          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 md:h-11 md:px-4"
          >
            {loading ? <Spinner className="text-white" /> : <SendHorizonal className="h-4 w-4" />}
            <span className="hidden sm:inline">{loading ? 'Sending...' : 'Send'}</span>
          </button>
        </form>
      </div>
    </footer>
  );
}
