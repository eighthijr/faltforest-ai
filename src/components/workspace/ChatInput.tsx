import { FormEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { Lock, SendHorizonal } from 'lucide-react';
import { Spinner } from '../ui';

type ChatInputProps = {
  value: string;
  disabled?: boolean;
  loading?: boolean;
  locked?: boolean;
  waitingConfirmation?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLockedClick?: () => void;
};

export function ChatInput({
  value,
  disabled = false,
  loading = false,
  locked = false,
  waitingConfirmation = false,
  placeholder,
  onChange,
  onSubmit,
  onLockedClick,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 44), 168)}px`;
  }, [value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const isDisabled = disabled || locked || waitingConfirmation;
  const helperText = waitingConfirmation
    ? 'Chat revisi akan terbuka setelah admin mengonfirmasi pembayaran.'
    : locked
      ? 'Upgrade premium untuk membuka chat revisi lanjutan.'
      : null;

  return (
    <footer className="sticky bottom-0 shrink-0 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:px-6 md:py-3">
      <div className="mx-auto w-full max-w-4xl">
        <form onSubmit={onSubmit} className="flex items-end">
          <div className="flex w-full items-center gap-2 rounded-[28px] border border-slate-200 bg-white px-2 py-2 shadow-[0_2px_10px_rgba(15,23,42,0.08)] focus-within:border-indigo-300 focus-within:shadow-[0_3px_14px_rgba(79,70,229,0.15)]">
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isDisabled}
              className="max-h-32 w-full resize-none overflow-y-auto bg-transparent px-3 py-[11px] text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 md:max-h-40"
            />

            <button
              type="submit"
              onClick={() => {
                if (locked) onLockedClick?.();
              }}
              disabled={waitingConfirmation || (!locked && (disabled || !value.trim()))}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-400 text-white transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {locked ? <Lock className="h-4 w-4" /> : loading ? <Spinner className="text-white" /> : <SendHorizonal className="h-4 w-4" />}
            </button>
          </div>
        </form>
        {helperText ? <p className="mt-2 px-1 text-xs font-medium text-slate-500">{helperText}</p> : null}
      </div>
    </footer>
  );
}
