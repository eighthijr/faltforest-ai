import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser, toNextResponse } from '@/server/next/http';
import { postManualQrisSubmitProof } from '@/server/payments/routes';
import { getSupabaseAdmin } from '@/server/supabaseAdmin';

const PROOF_BUCKET = process.env.NEXT_PUBLIC_QRIS_BUCKET || 'payment-assets';
const PREMIUM_PRICE = 99000;

function getFileExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.trim().toLowerCase();
  if (fromName) return fromName;

  const fromType = file.type.split('/').pop()?.trim().toLowerCase();
  return fromType || 'jpg';
}

function buildPublicUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return '';
  return `${base}/storage/v1/object/public/${PROOF_BUCKET}/${path}`;
}

export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const projectId = formData.get('projectId');
  const file = formData.get('file');

  if (typeof projectId !== 'string' || !projectId) {
    return NextResponse.json({ message: 'projectId wajib diisi.' }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Bukti transfer wajib diupload.' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ message: 'Bukti transfer harus berupa gambar.' }, { status: 400 });
  }

  try {
    const reference = `MNL-${Date.now()}-${projectId.slice(0, 6)}`;
    const ext = getFileExtension(file);
    const proofPath = `manual-proofs/${user.id}/${reference}.${ext}`;

    const bytes = await file.arrayBuffer();
    const supabaseAdmin = getSupabaseAdmin();
    const { error: uploadError } = await supabaseAdmin.storage.from(PROOF_BUCKET).upload(proofPath, bytes, {
      upsert: true,
      contentType: file.type,
    });

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
        return NextResponse.json(
          {
            message: `Bucket "${PROOF_BUCKET}" tidak ditemukan. Buat bucket tersebut di Supabase Storage (public), lalu upload ulang.`,
          },
          { status: 400 },
        );
      }

      throw new Error(uploadError.message);
    }

    const result = await postManualQrisSubmitProof({
      body: {
        projectId,
        reference,
        amount: PREMIUM_PRICE,
        proofPath,
      },
      headers: {},
      user,
    });

    if (result.status >= 400) {
      return toNextResponse(result);
    }

    return NextResponse.json({
      ...(result.body as object),
      reference,
      proofUrl: buildPublicUrl(proofPath),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
