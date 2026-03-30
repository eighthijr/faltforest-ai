import type { ReactNode } from 'react';

type WorkspaceLayoutProps = {
  header: ReactNode;
  body: ReactNode;
  input: ReactNode;
};

export function WorkspaceLayout({ header, body, input }: WorkspaceLayoutProps) {
  return (
    <section className="h-full overflow-hidden bg-white md:rounded-3xl md:shadow-[0_4px_18px_rgba(15,23,42,0.12)]">
      <div className="flex h-full min-h-0 flex-col">
        {header}
        {body}
        {input}
      </div>
    </section>
  );
}
