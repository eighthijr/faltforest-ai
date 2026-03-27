'use client';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Spinner({ size = 'sm', className = '' }: SpinnerProps) {
  const dimensions = size === 'lg' ? 'h-10 w-10 border-[3px]' : size === 'md' ? 'h-5 w-5 border-2' : 'h-4 w-4 border-2';
  return <span className={`inline-block ${dimensions} animate-spin rounded-full border-current border-r-transparent ${className}`} aria-hidden="true" />;
}
