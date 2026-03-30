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
    <footer className="sticky bottom-0 shrink-0 border-t border-white/10 bg-[#1b1d22]/95 px-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:px-6 md:py-3.5">
      <div className="mx-auto w-full max-w-4xl px-3 md:px-0">
        <form onSubmit={onSubmit} className="flex items-end">
          <div className="flex w-full items-end gap-2 rounded-[28px] border border-white/15 bg-[#2a2d34] px-2.5 py-2 shadow-[0_12px_30px_rgba(2,6,23,0.45)] focus-within:border-indigo-300/80 focus-within:shadow-[0_16px_35px_rgba(55,48,163,0.35)]">
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isDisabled}
              className="max-h-32 w-full resize-none overflow-y-auto bg-transparent px-3 py-[11px] text-[15px] leading-6 text-slate-100 outline-none placeholder:text-slate-500 md:max-h-40"
            />

            <button
              type="submit"
              onClick={() => {
                if (locked) onLockedClick?.();
              }}
              disabled={waitingConfirmation || (!locked && (disabled || !value.trim()))}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {locked ? <Lock className="h-4 w-4" /> : loading ? <Spinner className="text-slate-900" /> : <SendHorizonal className="h-4 w-4" />}
            </button>
          </div>
        </form>
        {helperText ? <p className="mt-2 px-1 text-xs font-medium text-slate-400">{helperText}</p> : null}
      </div>
    </footer>
  );
}
