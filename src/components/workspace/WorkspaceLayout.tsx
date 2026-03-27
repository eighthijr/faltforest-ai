import type { ReactNode } from 'react';

type WorkspaceLayoutProps = {
  header: ReactNode;
  body: ReactNode;
  input: ReactNode;
};

export function WorkspaceLayout({ header, body, input }: WorkspaceLayoutProps) {
  return (
    <section className="material-page mx-auto min-h-screen w-full max-w-[1200px] px-4 py-4 md:px-6">
      <div className="flex h-[calc(100vh-2rem)] min-h-[680px] flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(99,102,241,0.1)] backdrop-blur md:h-[calc(100vh-3rem)]">
        {header}
        {body}
        {input}
      </div>
    </section>
  );
}
