'use client';

import { WorkspaceChat } from '@/components/workspace';

export default function WorkspacePage() {
  return (
    <WorkspaceChat
      projectId="replace-with-project-id"
      projectType="free"
      onUpgradeClick={() => (window.location.href = '/pricing')}
    />
  );
}
