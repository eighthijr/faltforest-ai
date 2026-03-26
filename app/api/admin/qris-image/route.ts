import { NextRequest, NextResponse } from 'next/server';
import { getAdminCookieName, verifySession } from '@/server/admin/auth';
import { getSupabaseAdmin } from '@/server/supabaseAdmin';

const QRIS_PATH = 'manual-qris/current.png';

function requireAdminSession(req: NextRequest) {
  const token = req.cookies.get(getAdminCookieName())?.value;
  const session = verifySession(token);

  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  return session;
}

function buildPublicUrl() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return '';
  return `${base}/storage/v1/object/public/payment-assets/${QRIS_PATH}`;
}

export async function GET(req: NextRequest) {
  try {
    requireAdminSession(req);
    return NextResponse.json({ imageUrl: buildPublicUrl() });
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdminSession(req);

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'File wajib diupload.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'File harus berupa gambar.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.storage.from('payment-assets').upload(QRIS_PATH, bytes, {
      upsert: true,
      contentType: file.type,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, imageUrl: `${buildPublicUrl()}?t=${Date.now()}` });
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
