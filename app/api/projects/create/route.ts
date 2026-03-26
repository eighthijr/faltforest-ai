import { NextRequest } from 'next/server';
import { postCreateProject } from '@/server/projects/routes';
import { getRequestUser, toNextResponse } from '@/server/next/http';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await postCreateProject({
    body,
    headers: {
      'x-idempotency-key': req.headers.get('x-idempotency-key') ?? undefined,
    },
    user: await getRequestUser(req),
  });

  return toNextResponse(result);
}
