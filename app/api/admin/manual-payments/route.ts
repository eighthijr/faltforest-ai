import { NextRequest, NextResponse } from 'next/server';
import { getAdminActorId, getAdminCookieName, verifySession } from '@/server/admin/auth';
import { getSupabaseAdmin } from '@/server/supabaseAdmin';

function requireAdminSession(req: NextRequest) {
  const token = req.cookies.get(getAdminCookieName())?.value;
  const session = verifySession(token);

  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  return session;
}

export async function GET(req: NextRequest) {
  try {
    requireAdminSession(req);

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('id, reference, amount, status, gateway, created_at, updated_at, project_id, user_id')
      .eq('gateway', 'manual_qris')
      .in('status', ['pending', 'waiting_confirmation'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ payments: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdminSession(req);

    const body = (await req.json().catch(() => null)) as { reference?: string; approve?: boolean } | null;

    if (!body?.reference || typeof body.approve !== 'boolean') {
      return NextResponse.json({ message: 'reference dan approve(boolean) wajib diisi.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.rpc('admin_decide_manual_payment', {
      p_admin_id: getAdminActorId(),
      p_reference: body.reference,
      p_approve: body.approve,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ payment: data });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
