import { NextRequest } from 'next/server';
import { postTrackEvent } from '@/server/analytics/routes';
import { getRequestUser, toNextResponse } from '@/server/next/http';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await postTrackEvent({
    body,
    user: await getRequestUser(req),
  });

  return toNextResponse(result);
}
