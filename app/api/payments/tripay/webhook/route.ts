import { NextRequest } from 'next/server';
import { postTripayWebhook } from '@/server/payments/routes';
import { toNextResponse } from '@/server/next/http';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const body = JSON.parse(rawBody || '{}');

  const result = await postTripayWebhook({
    body,
    rawBody,
    headers: {
      'x-callback-signature': req.headers.get('x-callback-signature') ?? undefined,
      'x-callback-event': req.headers.get('x-callback-event') ?? undefined,
    },
    user: undefined,
  });

  return toNextResponse(result);
}
