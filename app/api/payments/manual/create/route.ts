import { NextRequest } from 'next/server';
import { postManualQrisCreate } from '@/server/payments/routes';
import { getRequestUser, toNextResponse } from '@/server/next/http';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await postManualQrisCreate({
    body,
    headers: {
      'x-idempotency-key': req.headers.get('x-idempotency-key') ?? undefined,
    },
    user: getRequestUser(req),
  });

  return toNextResponse(result);
}
