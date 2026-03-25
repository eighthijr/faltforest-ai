import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { AppError } from '../common/errors';
import { logEvent } from '../common/logger';

export async function createProjectServer(input: {
  userId: string;
  type: 'free' | 'premium';
  idempotencyKey?: string | null;
}) {
  const { data, error } = await supabaseAdmin.rpc('create_project_atomic', {
    p_user_id: input.userId,
    p_type: input.type,
    p_idempotency_key: input.idempotencyKey ?? null,
  });

  if (error) {
    if (error.message.includes('FREE_LIMIT_REACHED')) {
      throw new AppError('FREE_LIMIT_REACHED', 'User sudah punya project FREE.', 409);
    }
    throw new AppError('PROJECT_CREATE_FAILED', error.message, 500);
  }

  logEvent('info', 'project_creation', {
    user_id: input.userId,
    project_id: (data as { id?: string })?.id ?? null,
    type: input.type,
  });

  return data;
}

export async function assertProjectOwner(userId: string, projectId: string) {
  const { error } = await supabaseAdmin.rpc('assert_project_ownership', {
    p_user_id: userId,
    p_project_id: projectId,
  });

  if (error) throw new AppError('FORBIDDEN', 'Project bukan milik user.', 403);
}
