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

export function IconMenu(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </BaseIcon>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </BaseIcon>
  );
}

export function IconWorkspace(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 6.5h16" />
      <path d="M6.5 6.5V18a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V6.5" />
      <path d="M9.5 11.5h5" />
      <path d="M9.5 15h3.5" />
    </BaseIcon>
  );
}

export function IconPricing(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 9.5a2 2 0 0 1 2-1.5 2 2 0 0 1 2 2c0 1.8-1.5 2.2-2 2.3-.5.1-2 .5-2 2.2a2 2 0 0 0 2 2 2.2 2.2 0 0 0 2.2-1.8" />
      <path d="M12 6.5v11" />
    </BaseIcon>
  );
}

export function IconProfile(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </BaseIcon>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m7 10 5 5 5-5" />
    </BaseIcon>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.5V7M16 3.5V7M4 10.5h16" />
    </BaseIcon>
  );
}

export function IconTag(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 12 12 4.5h6.5v6.5L11 18.5 4.5 12Z" />
      <circle cx="15.5" cy="8.5" r="1" />
    </BaseIcon>
  );
}

export function IconStatus(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12 2.2 2.2 4.8-4.8" />
    </BaseIcon>
  );
}

export function IconId(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 5 6 19M14 5l-2 14M4 10h16M3 14h16" />
    </BaseIcon>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10" />
      <path d="M13 8.5 18 12l-5 3.5" />
      <path d="M18 12H9" />
    </BaseIcon>
  );
}

export function IconUser(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 19a6 6 0 0 1 12 0" />
    </BaseIcon>
  );
}
