import { NextRequest, NextResponse } from 'next/server';
import { getAdminCookieName, getAdminActorId, verifySession } from '@/server/admin/auth';
import { getDashboard } from '@/server/analytics/routes';

function requireAdminSession(req: NextRequest) {
  const token = req.cookies.get(getAdminCookieName())?.value;
  const session = verifySession(token);
  if (!session) throw new Error('UNAUTHORIZED');
}

export async function GET(req: NextRequest) {
  try {
    requireAdminSession(req);

    const result = await getDashboard({
      query: {
        from: req.nextUrl.searchParams.get('from') ?? undefined,
        to: req.nextUrl.searchParams.get('to') ?? undefined,
      },
      user: {
        id: getAdminActorId(),
        role: 'admin',
      },
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Admin session tidak valid.' }, { status: 401 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
