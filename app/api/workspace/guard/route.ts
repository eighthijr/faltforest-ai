import { NextRequest } from 'next/server';
import { postWorkspaceActionGuard } from '@/server/workspace/routes';
import { getRequestUser, toNextResponse } from '@/server/next/http';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await postWorkspaceActionGuard({
    body,
    user: getRequestUser(req),
  });

  return toNextResponse(result);
}
