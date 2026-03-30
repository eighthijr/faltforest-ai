import type { ReactNode } from 'react';

type WorkspaceLayoutProps = {
  header: ReactNode;
  body: ReactNode;
  input: ReactNode;
};

export function WorkspaceLayout({ header, body, input }: WorkspaceLayoutProps) {
  return (
    <section className="h-full overflow-hidden bg-[#14161a] md:rounded-3xl md:border md:border-white/10 md:shadow-[0_18px_48px_rgba(2,6,23,0.45)]">
      <div className="flex h-full min-h-0 flex-col">
        {header}
        {body}
        {input}
      </div>
    </section>
  );
}
