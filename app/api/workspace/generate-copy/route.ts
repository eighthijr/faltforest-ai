import { NextRequest, NextResponse } from 'next/server';

type GenerateCopyPayload = {
  projectId?: string;
  product?: string;
  target?: string;
  benefit?: string;
  images?: string;
};

type GenerateCopyResult = {
  copy?: string;
  message?: string;
};

function buildPrompt(body: Required<GenerateCopyPayload>) {
  return [
    'Kamu adalah copywriter Indonesia untuk landing page digital product.',
    'Tulis copy landing page dalam bahasa Indonesia yang persuasif, jelas, dan langsung bisa dipakai.',
    'Gunakan format markdown dengan urutan bagian:',
    '1) Headline utama',
    '2) Subheadline',
    '3) Problem audiens',
    '4) Solusi / value proposition',
    '5) Benefit bullets (minimal 5)',
    '6) CTA utama + CTA sekunder',
    '',
    `Produk: ${body.product}`,
    `Target audiens: ${body.target}`,
    `Manfaat utama: ${body.benefit}`,
    `Preferensi gaya visual/gambar: ${body.images}`,
    '',
    'Hindari klaim berlebihan, jangan pakai placeholder seperti [nama produk], dan jangan menambahkan penjelasan di luar copy.',
  ].join('\n');
}

async function generateWithGemini(body: Required<GenerateCopyPayload>) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      result: { message: 'GEMINI_API_KEY belum diatur di server.' } as GenerateCopyResult,
    };
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(body) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 1200,
        },
      }),
      cache: 'no-store',
    },
  );

  const raw = (await response.json().catch(() => null)) as
    | {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string };
      }
    | null;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      result: {
        message: raw?.error?.message ?? 'Permintaan ke Gemini gagal diproses.',
      } as GenerateCopyResult,
    };
  }

  const copy = raw?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n').trim();

  if (!copy) {
    return {
      ok: false,
      status: 502,
      result: { message: 'Gemini tidak mengembalikan copy yang valid.' } as GenerateCopyResult,
    };
  }

  return {
    ok: true,
    status: 200,
    result: { copy } as GenerateCopyResult,
  };
}

async function generateViaSupabaseEdge(body: Required<GenerateCopyPayload>, authorizationHeader: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      status: 500,
      result: { message: 'Konfigurasi Supabase belum lengkap di server.' } as GenerateCopyResult,
    };
  }

  const functionCandidates = ['generate-copy', 'generate_copy'];

  let response: Response | null = null;
  let result: GenerateCopyResult | null = null;

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

    result = (await response.json().catch(() => null)) as GenerateCopyResult | null;

    const functionNotFound =
      response.status === 404 && result?.message?.toLowerCase().includes('requested function was not found');

    if (!functionNotFound) break;
  }

  if (!response) {
    return {
      ok: false,
      status: 503,
      result: { message: 'Layanan generate copy tidak tersedia saat ini.' } as GenerateCopyResult,
    };
  }

  if (!response.ok) {
    const functionNotFound =
      response.status === 404 && result?.message?.toLowerCase().includes('requested function was not found');

    if (functionNotFound) {
      return {
        ok: false,
        status: 503,
        result: {
          message:
            'Layanan AI belum aktif di server (Edge Function generate-copy belum terpasang). Aktifkan GEMINI_API_KEY di server atau deploy Edge Function.',
        } as GenerateCopyResult,
      };
    }

    return {
      ok: false,
      status: response.status,
      result: { message: result?.message ?? 'Generate copy gagal diproses oleh Edge Function.' } as GenerateCopyResult,
    };
  }

  return {
    ok: true,
    status: 200,
    result: result ?? ({} as GenerateCopyResult),
  };
}

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

    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
      return NextResponse.json({ message: 'Sesi login tidak ditemukan. Silakan login ulang.' }, { status: 401 });
    }

    const payload = body as Required<GenerateCopyPayload>;

    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
      const geminiResult = await generateWithGemini(payload);
      return NextResponse.json(geminiResult.result, { status: geminiResult.status });
    }

    const edgeResult = await generateViaSupabaseEdge(payload, authorizationHeader);
    return NextResponse.json(edgeResult.result, { status: edgeResult.status });
  } catch {
    return NextResponse.json(
      {
        message: 'Gagal mengirim request ke layanan generate copy. Coba lagi dalam beberapa saat.',
      },
      { status: 502 },
    );
  }
}
