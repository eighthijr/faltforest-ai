import { NextRequest } from 'next/server';
import { postTripayQrisCreate } from '@/server/payments/routes';
import { getRequestUser, toNextResponse } from '@/server/next/http';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await postTripayQrisCreate({
    body,
    headers: {
      'x-idempotency-key': req.headers.get('x-idempotency-key') ?? undefined,
    },
    user: await getRequestUser(req),
  });

  return toNextResponse(result);
}
