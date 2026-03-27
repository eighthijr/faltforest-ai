import { FormEvent, KeyboardEvent } from 'react';
import { Mic, Paperclip, SendHorizonal } from 'lucide-react';

type ChatInputProps = {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChatInput({ value, disabled = false, placeholder, onChange, onSubmit }: ChatInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const form = event.currentTarget.form;
      form?.requestSubmit();
    }
  };

  return (
    <footer className="sticky bottom-0 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur md:px-6 md:py-4">
      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-5xl items-end gap-2 md:gap-3">
        <button
          type="button"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition duration-200 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Attach file"
        >
          <Paperclip className="size-5" />
        </button>

        <div className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition duration-200 focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.14)]">
          <textarea
            rows={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="max-h-36 w-full resize-y bg-transparent py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="button"
          className="hidden size-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition duration-200 hover:bg-slate-100 hover:text-slate-700 md:inline-flex"
          aria-label="Voice input"
        >
          <Mic className="size-5" />
        </button>

        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white transition duration-200 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendHorizonal className="size-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </footer>
  );
}
