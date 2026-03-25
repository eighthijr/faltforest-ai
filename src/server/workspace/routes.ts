import { enforceWorkspacePaywall } from './policy';
import { toHttpError } from '../common/errors';

type HttpRequest = {
  body?: unknown;
  user?: { id?: string };
};

type HttpResponse = {
  status: number;
  body: unknown;
};

export async function postWorkspaceActionGuard(req: HttpRequest): Promise<HttpResponse> {
  try {
    if (!req.user?.id) {
      return { status: 401, body: { code: 'UNAUTHORIZED', message: 'Unauthorized' } };
    }

    const { projectId, action } = (req.body ?? {}) as {
      projectId?: string;
      action?: 'download' | 'chat_after_generation' | 'revision';
    };

    if (!projectId || !action) {
      return { status: 400, body: { code: 'BAD_REQUEST', message: 'projectId dan action wajib diisi.' } };
    }

    await enforceWorkspacePaywall({
      userId: req.user.id,
      projectId,
      action,
    });

    return { status: 200, body: { allowed: true } };
  } catch (error) {
    return toHttpError(error);
  }
}
