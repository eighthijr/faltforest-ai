import { NextRequest } from 'next/server';
import { postManualQrisAdminDecision } from '@/server/payments/routes';
import { getRequestUser, toNextResponse } from '@/server/next/http';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await postManualQrisAdminDecision({
    body,
    headers: {},
    user: getRequestUser(req),
  });

  return toNextResponse(result);
}
