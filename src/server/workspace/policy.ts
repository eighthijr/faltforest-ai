import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { AppError } from '../common/errors';

export async function enforceWorkspacePaywall(input: {
  userId: string;
  projectId: string;
  action: 'download' | 'chat_after_generation' | 'revision';
}) {
  const { error } = await supabaseAdmin.rpc('enforce_paywall_action', {
    p_user_id: input.userId,
    p_project_id: input.projectId,
    p_action: input.action,
  });

  if (error) {
    if (error.message.includes('Paywall enforced')) {
      throw new AppError('PAYWALL_BLOCKED', 'Upgrade ke premium untuk aksi ini.', 402, {
        action: input.action,
      });
    }

    if (error.message.includes('ownership')) {
      throw new AppError('FORBIDDEN', 'Project bukan milik user.', 403);
    }

    throw new AppError('PAYWALL_CHECK_FAILED', error.message, 500);
  }
}
