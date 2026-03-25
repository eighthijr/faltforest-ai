import { supabase } from '../lib/supabaseClient';
import type { CreateProjectInput, CreateProjectResult, Project } from '../types/project';

export async function listProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, user_id, type, status, generated_html, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Project[];
}

async function hasFreeProject(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'free');

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) > 0;
}

export async function createProject(input: CreateProjectInput): Promise<CreateProjectResult> {
  const type = input.type ?? 'free';

  if (type === 'free') {
    const alreadyHasFree = await hasFreeProject(input.userId);

    if (alreadyHasFree) {
      return {
        ok: false,
        reason: 'FREE_LIMIT_REACHED',
        message: 'Kamu sudah punya 1 project FREE. Upgrade untuk buat project baru.',
      };
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: input.userId,
      type,
      status: 'draft',
    })
    .select('id, user_id, type, status, generated_html, created_at')
    .single();

  if (error || !data) {
    return {
      ok: false,
      reason: 'UNKNOWN_ERROR',
      message: error?.message ?? 'Gagal membuat project. Coba lagi.',
    };
  }

  return { ok: true, project: data as Project };
}
