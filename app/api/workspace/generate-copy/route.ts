import { NextRequest, NextResponse } from 'next/server';

type GenerateCopyPayload = {
  projectId?: string;
  product?: string;
  target?: string;
  benefit?: string;
  images?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateCopyPayload;
    const requiredFields: Array<keyof GenerateCopyPayload> = ['projectId', 'product', 'target', 'benefit', 'images'];
    const missing = requiredFields.filter((field) => !body[field]?.trim());

    if (missing.length > 0) {
      return NextResponse.json(
        { message: `Data belum lengkap: ${missing.join(', ')}` },
        {
          status: 400,
        },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ message: 'Konfigurasi Supabase belum lengkap di server.' }, { status: 500 });
    }

    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ message: 'Sesi login tidak ditemukan. Silakan login ulang.' }, { status: 401 });
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/generate-copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: authorizationHeader,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const result = (await response.json().catch(() => null)) as { message?: string; copy?: string } | null;

    if (!response.ok) {
      return NextResponse.json(
        { message: result?.message ?? 'Generate copy gagal diproses oleh Edge Function.' },
        { status: response.status },
      );
    }

    return NextResponse.json(result ?? {}, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        message: 'Gagal mengirim request ke layanan generate copy. Coba lagi dalam beberapa saat.',
      },
      { status: 502 },
    );
  }
}
