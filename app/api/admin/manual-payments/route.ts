import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/server/next/http';
import { getSupabaseAdmin } from '@/server/supabaseAdmin';

async function requireAdminUser(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user || user.role !== 'admin') {
    throw new Error('UNAUTHORIZED');
  }

  return user;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const supabaseAdmin = getSupabaseAdmin();
    const withProofResult = await supabaseAdmin
      .from('payments')
      .select('id, reference, amount, status, gateway, created_at, updated_at, project_id, user_id, proof_path')
      .eq('gateway', 'manual_qris')
      .in('status', ['pending', 'waiting_confirmation'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (!withProofResult.error) {
      return NextResponse.json({ payments: withProofResult.data ?? [] });
    }

    const isMissingProofPathColumn =
      withProofResult.error.code === '42703' || withProofResult.error.message.includes('payments.proof_path');

    if (!isMissingProofPathColumn) {
      throw new Error(withProofResult.error.message);
    }

    const withoutProofResult = await supabaseAdmin
      .from('payments')
      .select('id, reference, amount, status, gateway, created_at, updated_at, project_id, user_id')
      .eq('gateway', 'manual_qris')
      .in('status', ['pending', 'waiting_confirmation'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (withoutProofResult.error) {
      throw new Error(withoutProofResult.error.message);
    }

    const paymentsWithoutProof = (withoutProofResult.data ?? []).map((payment: Record<string, unknown>) => ({
      ...payment,
      proof_path: null,
    }));

    return NextResponse.json({ payments: paymentsWithoutProof });
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
    const admin = await requireAdminUser(req);

    const body = (await req.json().catch(() => null)) as { reference?: string; approve?: boolean } | null;

    if (!body?.reference || typeof body.approve !== 'boolean') {
      return NextResponse.json({ message: 'reference dan approve(boolean) wajib diisi.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.rpc('admin_decide_manual_payment', {
      p_admin_id: admin.id,
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
