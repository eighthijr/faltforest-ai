export type ProjectType = 'free' | 'premium';
export type ProjectStatus = 'draft' | 'ready' | 'generated';

export type Project = {
  id: string;
  user_id: string;
  type: ProjectType;
  status: ProjectStatus;
  generated_html: string | null;
  created_at: string;
};

export type CreateProjectInput = {
  userId: string;
  type?: ProjectType;
};

export type CreateProjectResult =
  | { ok: true; project: Project }
  | { ok: false; reason: 'FREE_LIMIT_REACHED' | 'UNKNOWN_ERROR'; message: string };
