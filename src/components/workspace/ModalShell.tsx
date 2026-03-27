import { type ReactNode, useEffect, useId } from 'react';

type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
};

const sizeClass: Record<NonNullable<ModalShellProps['size']>, string> = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-6xl',
};

export function ModalShell({ open, onClose, title, children, size = 'md', closeOnBackdrop = true }: ModalShellProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`my-4 w-full ${sizeClass[size]} max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl animate-modal-in`}>
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
