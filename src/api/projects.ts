import { supabase } from '../lib/supabaseClient';
import type { CreateProjectInput, CreateProjectResult, Project } from '../types/project';

export async function listProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase.rpc('list_projects_for_user', {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Project[];
}

export async function createProject(input: CreateProjectInput): Promise<CreateProjectResult> {
  const type = input.type ?? 'free';

  const { data, error } = await supabase.rpc('create_project_atomic', {
    p_user_id: input.userId,
    p_type: type,
    p_idempotency_key: null,
  });

  if (error || !data) {
    if (error?.message?.includes('FREE_LIMIT_REACHED')) {
      return {
        ok: false,
        reason: 'FREE_LIMIT_REACHED',
        message: 'Kamu sudah punya 1 project FREE. Upgrade untuk buat project baru.',
      };
    }

    return {
      ok: false,
      reason: 'UNKNOWN_ERROR',
      message: error?.message ?? 'Gagal membuat project. Coba lagi.',
    };
  }

  return { ok: true, project: data as Project };
}
