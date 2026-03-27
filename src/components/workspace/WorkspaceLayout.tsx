import type { ReactNode } from 'react';

type WorkspaceLayoutProps = {
  header: ReactNode;
  body: ReactNode;
  input: ReactNode;
};

export function WorkspaceLayout({ header, body, input }: WorkspaceLayoutProps) {
  return (
    <section className="material-page box-border h-[100dvh] w-full overflow-hidden p-2 md:p-4">
      <div className="material-surface mx-auto flex h-full w-full max-w-[1120px] min-h-0 flex-col overflow-hidden">
        {header}
        {body}
        {input}
      </div>
    </section>
  );
}
