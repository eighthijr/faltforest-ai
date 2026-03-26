import { supabase } from '../lib/supabaseClient';
import type { WorkspaceAnswers } from '../types/workspace';

type GenerateCopyInput = {
  projectId: string;
  answers: WorkspaceAnswers;
};

export async function saveAnswersDraft(input: GenerateCopyInput) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user?.id) {
    throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');
  }

  const payload = {
    answers: input.answers,
  };

  const { error } = await supabase
    .from('events')
    .insert({
      user_id: user.id,
      event_name: 'workspace_answers_saved',
      metadata: {
        project_id: input.projectId,
        ...payload,
      },
    });

  // Analytics event is best-effort; jangan blokir alur generate jika policy analytics tertutup.
  if (error && error.code !== '42501') throw new Error(error.message);

  const { error: projectError } = await supabase.rpc('mark_workspace_project_ready', {
    p_project_id: input.projectId,
  });

  if (projectError) throw new Error(projectError.message);
}

export async function generateCopyOnce(input: GenerateCopyInput): Promise<string> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user?.id) throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');

  const { data: project, error: readError } = await supabase.rpc('get_workspace_project', {
    p_project_id: input.projectId,
  });

  if (readError) throw new Error(readError.message);
  if (!project) throw new Error('Project tidak ditemukan atau kamu tidak punya akses.');

  if (project.generated_html) {
    return project.generated_html;
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw new Error(sessionError.message);
  if (!session?.access_token) throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');

  // Single AI call entry point: invoke backend proxy exactly once when no generated_html exists.
  const response = await fetch('/api/workspace/generate-copy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      projectId: input.projectId,
      product: input.answers.product,
      target: input.answers.target,
      benefit: input.answers.benefit,
      images: input.answers.images,
    }),
  });

  const data = (await response.json().catch(() => null)) as { copy?: string; message?: string } | null;
  if (!response.ok) throw new Error(data?.message ?? 'Gagal menghubungi layanan generate copy.');

  const generatedCopy = (data?.copy as string | undefined)?.trim();
  if (!generatedCopy) throw new Error('AI tidak mengembalikan copy yang valid.');

  const { data: updated, error: updateError } = await supabase.rpc('save_workspace_generated_copy', {
    p_project_id: input.projectId,
    p_generated_html: generatedCopy,
  });

  if (updateError) throw new Error(updateError.message);

  if (!updated) {
    const { data: refreshedProject, error: refreshError } = await supabase.rpc('get_workspace_project', {
      p_project_id: input.projectId,
    });

    if (refreshError) throw new Error(refreshError.message);
    if (refreshedProject?.generated_html) return refreshedProject.generated_html;
  }

  return generatedCopy;
}
