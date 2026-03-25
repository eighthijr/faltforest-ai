import { createProjectServer } from './service';
import { toHttpError } from '../common/errors';

type HttpRequest = {
  body?: unknown;
  headers?: Record<string, string | undefined>;
  user?: { id?: string };
};

type HttpResponse = {
  status: number;
  body: unknown;
};

export async function postCreateProject(req: HttpRequest): Promise<HttpResponse> {
  try {
    if (!req.user?.id) return { status: 401, body: { message: 'Unauthorized' } };

    const { type } = (req.body ?? {}) as { type?: 'free' | 'premium' };
    if (!type) return { status: 400, body: { message: 'type wajib diisi.' } };

    const idempotencyKey = req.headers?.['x-idempotency-key'] ?? null;
    const project = await createProjectServer({
      userId: req.user.id,
      type,
      idempotencyKey,
    });

    return { status: 200, body: { project } };
  } catch (error) {
    return toHttpError(error);
  }
}
