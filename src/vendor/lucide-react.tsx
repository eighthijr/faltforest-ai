import type { ComponentType, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;
export type LucideIcon = ComponentType<IconProps>;

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

export const Circle = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="12" r="8" /></BaseIcon>;
export const Download = (props: IconProps) => <BaseIcon {...props}><path d="M12 4v10" /><path d="m8 10 4 4 4-4" /><path d="M5 19h14" /></BaseIcon>;
export const Eraser = (props: IconProps) => <BaseIcon {...props}><path d="m7 16 8.6-8.6a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8L10.6 19H7z" /><path d="M7 16 3 12l6-6 4 4" /><path d="M13 19h8" /></BaseIcon>;
export const Settings2 = (props: IconProps) => <BaseIcon {...props}><path d="M4 7h10" /><path d="M4 17h16" /><circle cx="17" cy="7" r="3" /><circle cx="9" cy="17" r="3" /></BaseIcon>;
export const Sparkles = (props: IconProps) => <BaseIcon {...props}><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" /><path d="m18 15 .9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15Z" /></BaseIcon>;
export const Bot = (props: IconProps) => <BaseIcon {...props}><rect x="5" y="7" width="14" height="11" rx="3" /><path d="M12 4v3" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /></BaseIcon>;
export const UserCircle2 = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="9" r="2.5" /><path d="M7.5 18a5 5 0 0 1 9 0" /></BaseIcon>;
export const Mic = (props: IconProps) => <BaseIcon {...props}><rect x="9" y="4" width="6" height="10" rx="3" /><path d="M6 11a6 6 0 0 0 12 0" /><path d="M12 17v3" /></BaseIcon>;
export const Paperclip = (props: IconProps) => <BaseIcon {...props}><path d="m8 12.5 6.4-6.4a3 3 0 0 1 4.2 4.2l-7.8 7.8a5 5 0 0 1-7-7l7.8-7.8" /></BaseIcon>;
export const SendHorizonal = (props: IconProps) => <BaseIcon {...props}><path d="M3 11.5 21 4l-7.5 17-2.7-6.8L3 11.5Z" /><path d="M10.8 14.2 21 4" /></BaseIcon>;
export const ArrowLeft = (props: IconProps) => <BaseIcon {...props}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></BaseIcon>;
export const ChevronRight = (props: IconProps) => <BaseIcon {...props}><path d="m9 6 6 6-6 6" /></BaseIcon>;

export const AlertCircle = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><circle cx="12" cy="16.5" r=".5" /></BaseIcon>;
export const LogOut = (props: IconProps) => <BaseIcon {...props}><path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10" /><path d="M13 8.5 18 12l-5 3.5" /><path d="M18 12H9" /></BaseIcon>;
export const MoreHorizontal = (props: IconProps) => <BaseIcon {...props}><circle cx="6" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="18" cy="12" r="1" /></BaseIcon>;
export const BarChart3 = (props: IconProps) => <BaseIcon {...props}><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20V8" /></BaseIcon>;
export const CreditCard = (props: IconProps) => <BaseIcon {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></BaseIcon>;
export const LayoutDashboard = (props: IconProps) => <BaseIcon {...props}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></BaseIcon>;
export const Menu = (props: IconProps) => <BaseIcon {...props}><path d="M4 7h16M4 12h16M4 17h16" /></BaseIcon>;
export const MessageSquareText = (props: IconProps) => <BaseIcon {...props}><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H6a2 2 0 0 1-2-2Z" /><path d="M8 9h8M8 12h6" /></BaseIcon>;
export const ShieldCheck = (props: IconProps) => <BaseIcon {...props}><path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z" /><path d="m9.5 12 1.8 1.8 3.2-3.2" /></BaseIcon>;
export const User = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="8" r="3" /><path d="M6 19a6 6 0 0 1 12 0" /></BaseIcon>;
export const Activity = (props: IconProps) => <BaseIcon {...props}><path d="M3 12h4l2-5 4 10 2-5h6" /></BaseIcon>;
export const CalendarClock = (props: IconProps) => <BaseIcon {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 9h18" /><path d="M15 14v3h2" /><circle cx="15" cy="17" r="3" /></BaseIcon>;
export const CircleCheck = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.2 2.2 4.8-4.8" /></BaseIcon>;
export const CircleDashed = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="12" r="9" strokeDasharray="3 3" /></BaseIcon>;
export const Crown = (props: IconProps) => <BaseIcon {...props}><path d="M3 8 8 13l4-6 4 6 5-5-2 10H5L3 8Z" /></BaseIcon>;
export const FlaskConical = (props: IconProps) => <BaseIcon {...props}><path d="M10 3h4" /><path d="M10 3v4l-4.5 8a3 3 0 0 0 2.6 4.5h7.8a3 3 0 0 0 2.6-4.5L14 7V3" /><path d="M8 14h8" /></BaseIcon>;
export const Hash = (props: IconProps) => <BaseIcon {...props}><path d="M8 4 6 20M16 4l-2 16M4 9h16M3 15h16" /></BaseIcon>;
export const ArrowRight = (props: IconProps) => <BaseIcon {...props}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></BaseIcon>;
export const CheckCircle2 = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.2 2.2 4.8-4.8" /></BaseIcon>;
export const Clock3 = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5h4" /></BaseIcon>;
export const LayoutTemplate = (props: IconProps) => <BaseIcon {...props}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 10v10" /></BaseIcon>;
export const Zap = (props: IconProps) => <BaseIcon {...props}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></BaseIcon>;
export const Trash2 = (props: IconProps) => <BaseIcon {...props}><path d="M4 7h16" /><path d="M9 7V5h6v2" /><path d="m8 7 1 12h6l1-12" /></BaseIcon>;
export const BadgeCheck = (props: IconProps) => <BaseIcon {...props}><path d="m12 3 2.2 1.3 2.6-.3.9 2.5 2 1.7-1.3 2.2 1.3 2.2-2 1.7-.9 2.5-2.6-.3L12 21l-2.2-1.3-2.6.3-.9-2.5-2-1.7 1.3-2.2-1.3-2.2 2-1.7.9-2.5 2.6.3L12 3Z" /><path d="m9.5 12 1.8 1.8 3.2-3.2" /></BaseIcon>;
export const ImagePlus = (props: IconProps) => <BaseIcon {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m8 13 2-2 3 3 2-2 3 3" /><circle cx="8" cy="9" r="1" /><path d="M19 3v4M17 5h4" /></BaseIcon>;
export const RefreshCcw = (props: IconProps) => <BaseIcon {...props}><path d="M3 12a9 9 0 0 1 15-6" /><path d="M18 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6" /><path d="M6 21v-5h5" /></BaseIcon>;
export const FolderKanban = (props: IconProps) => <BaseIcon {...props}><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><rect x="7" y="11" width="4" height="4" rx="1" /><rect x="13" y="11" width="4" height="2" rx="1" /></BaseIcon>;
export const Mail = (props: IconProps) => <BaseIcon {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></BaseIcon>;
export const Lock = (props: IconProps) => <BaseIcon {...props}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></BaseIcon>;
export const FileUp = (props: IconProps) => <BaseIcon {...props}><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" /><path d="M14 2v5h5" /><path d="m12 18 0-6" /><path d="m9.5 14.5 2.5-2.5 2.5 2.5" /></BaseIcon>;
export const LoaderCircle = (props: IconProps) => <BaseIcon {...props}><path d="M21 12a9 9 0 1 1-9-9" /></BaseIcon>;
