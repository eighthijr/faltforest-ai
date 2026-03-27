import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ className = 'h-5 w-5', children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function Circle(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
    </BaseIcon>
  );
}

export function Download(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 19h14" />
    </BaseIcon>
  );
}

export function Eraser(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m7 16 8.6-8.6a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8L10.6 19H7z" />
      <path d="M7 16 3 12l6-6 4 4" />
      <path d="M13 19h8" />
    </BaseIcon>
  );
}

export function Settings2(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7h10" />
      <path d="M4 17h16" />
      <circle cx="17" cy="7" r="3" />
      <circle cx="9" cy="17" r="3" />
    </BaseIcon>
  );
}

export function Sparkles(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="m18 15 .9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15Z" />
    </BaseIcon>
  );
}

export function Bot(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="5" y="7" width="14" height="11" rx="3" />
      <path d="M12 4v3" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
    </BaseIcon>
  );
}

export function UserCircle2(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="9" r="2.5" />
      <path d="M7.5 18a5 5 0 0 1 9 0" />
    </BaseIcon>
  );
}

export function Mic(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="9" y="4" width="6" height="10" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v3" />
    </BaseIcon>
  );
}

export function Paperclip(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m8 12.5 6.4-6.4a3 3 0 0 1 4.2 4.2l-7.8 7.8a5 5 0 0 1-7-7l7.8-7.8" />
    </BaseIcon>
  );
}

export function SendHorizonal(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 11.5 21 4l-7.5 17-2.7-6.8L3 11.5Z" />
      <path d="M10.8 14.2 21 4" />
    </BaseIcon>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </BaseIcon>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m9 6 6 6-6 6" />
    </BaseIcon>
  );
}
