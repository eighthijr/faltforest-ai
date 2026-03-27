import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/server/next/http';
import { getDashboard } from '@/server/analytics/routes';

async function requireAdminUser(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user || user.role !== 'admin') throw new Error('UNAUTHORIZED');
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser(req);

    const result = await getDashboard({
      query: {
        from: req.nextUrl.searchParams.get('from') ?? undefined,
        to: req.nextUrl.searchParams.get('to') ?? undefined,
      },
      user: {
        id: admin.id,
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
