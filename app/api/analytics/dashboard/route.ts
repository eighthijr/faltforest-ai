import { NextRequest } from 'next/server';
import { getDashboard } from '@/server/analytics/routes';
import { getRequestUser, toNextResponse } from '@/server/next/http';

export async function GET(req: NextRequest) {
  const result = await getDashboard({
    query: {
      from: req.nextUrl.searchParams.get('from') ?? undefined,
      to: req.nextUrl.searchParams.get('to') ?? undefined,
    },
    user: getRequestUser(req),
  });

  return toNextResponse(result);
}
