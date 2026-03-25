import { supabase } from '../lib/supabaseClient';
import type { WorkspaceAnswers } from '../types/workspace';

type GenerateCopyInput = {
  projectId: string;
  answers: WorkspaceAnswers;
};

export async function saveAnswersDraft(input: GenerateCopyInput) {
  const payload = {
    answers: input.answers,
  };

  const { error } = await supabase
    .from('events')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id ?? null,
      event_name: 'workspace_answers_saved',
      metadata: {
        project_id: input.projectId,
        ...payload,
      },
    });

  if (error) throw new Error(error.message);

  const { error: projectError } = await supabase
    .from('projects')
    .update({ status: 'ready' })
    .eq('id', input.projectId);

  if (projectError) throw new Error(projectError.message);
}

export async function generateCopyOnce(input: GenerateCopyInput): Promise<string> {
  const { data: project, error: readError } = await supabase
    .from('projects')
    .select('id, status, generated_html')
    .eq('id', input.projectId)
    .single();

  if (readError) throw new Error(readError.message);

  if (project.generated_html) {
    return project.generated_html;
  }

  // Single AI call entry point: invoke backend function exactly once when no generated_html exists.
  const { data, error } = await supabase.functions.invoke('generate-copy', {
    body: {
      projectId: input.projectId,
      product: input.answers.product,
      target: input.answers.target,
      benefit: input.answers.benefit,
      images: input.answers.images,
    },
  });

  if (error) throw new Error(error.message);

  const generatedCopy = (data?.copy as string | undefined)?.trim();
  if (!generatedCopy) throw new Error('AI tidak mengembalikan copy yang valid.');

  const { error: updateError } = await supabase
    .from('projects')
    .update({
      status: 'generated',
      generated_html: generatedCopy,
    })
    .eq('id', input.projectId)
    .is('generated_html', null);

  if (updateError) throw new Error(updateError.message);

  return generatedCopy;
}
