import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/server/next/http';
import { getSupabaseAdmin } from '@/server/supabaseAdmin';

const QRIS_PATH = 'manual-qris/current.png';
const QRIS_BUCKET = process.env.NEXT_PUBLIC_QRIS_BUCKET || 'payment-assets';

async function requireAdminUser(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user || user.role !== 'admin') {
    throw new Error('UNAUTHORIZED');
  }

  return user;
}

function buildPublicUrl() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return '';
  return `${base}/storage/v1/object/public/${QRIS_BUCKET}/${QRIS_PATH}`;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);
    return NextResponse.json({ imageUrl: buildPublicUrl() });
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser(req);

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
    const { error } = await supabaseAdmin.storage.from(QRIS_BUCKET).upload(QRIS_PATH, bytes, {
      upsert: true,
      contentType: file.type,
    });

    if (error) {
      if (error.message.includes('Bucket not found')) {
        return NextResponse.json(
          {
            message: `Bucket "${QRIS_BUCKET}" tidak ditemukan. Buat bucket tersebut di Supabase Storage (public), lalu upload ulang.`,
          },
          { status: 400 },
        );
      }
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
