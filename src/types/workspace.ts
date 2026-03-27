import type { ProjectType } from './project';

export type WorkspaceState = 'draft' | 'ready' | 'generated';

export type QuestionKey = 'product' | 'target' | 'benefit' | 'images';

export type WorkspaceAnswers = Record<QuestionKey, string>;

export type WorkspaceMessage = {
  id: string;
  role: 'system' | 'user';
  content: string;
  cta?: {
    label: string;
    action: 'preview';
  };
};

export type WorkspaceContext = {
  projectId: string;
  projectType: ProjectType;
  state: WorkspaceState;
  answers: WorkspaceAnswers;
  generatedCopy: string | null;
  hasGeneratedOnce: boolean;
};

export type WorkspaceEvent =
  | { type: 'ANSWER_SUBMITTED'; key: QuestionKey; value: string }
  | { type: 'COLLECTION_COMPLETED' }
  | { type: 'GENERATION_SUCCEEDED'; copy: string }
  | { type: 'GENERATION_FAILED' }
  | { type: 'RESET_DRAFT' };
