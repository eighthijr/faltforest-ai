import { NextRequest, NextResponse } from 'next/server';
import { getAdminCookieName, verifySession } from '@/server/admin/auth';

export async function GET(req: NextRequest) {
  const session = verifySession(req.cookies.get(getAdminCookieName())?.value);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, username: session.username });
}
