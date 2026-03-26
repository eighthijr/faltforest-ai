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

    const functionCandidates = ['generate-copy', 'generate_copy'];

    let response: Response | null = null;
    let result: { message?: string; copy?: string } | null = null;

    for (const functionName of functionCandidates) {
      response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: authorizationHeader,
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });

      result = (await response.json().catch(() => null)) as { message?: string; copy?: string } | null;

      const functionNotFound =
        response.status === 404 && result?.message?.toLowerCase().includes('requested function was not found');

      if (!functionNotFound) break;
    }

    if (!response) {
      return NextResponse.json({ message: 'Layanan generate copy tidak tersedia saat ini.' }, { status: 503 });
    }

    if (!response.ok) {
      const functionNotFound =
        response.status === 404 && result?.message?.toLowerCase().includes('requested function was not found');

      if (functionNotFound) {
        return NextResponse.json(
          {
            message:
              'Layanan AI belum aktif di server (Edge Function generate-copy belum terpasang). Hubungi admin untuk deploy function.',
          },
          { status: 503 },
        );
      }

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
