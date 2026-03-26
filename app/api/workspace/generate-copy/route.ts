import { NextRequest, NextResponse } from 'next/server';

type GenerateCopyPayload = {
  projectId?: string;
  product?: string;
  target?: string;
  benefit?: string;
  images?: string;
};

type LandingPageSection = {
  title: string;
  body: string;
  bullets: string[];
};

type LandingPageSpec = {
  brandName: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCta: string;
  secondaryCta: string;
  sections: LandingPageSection[];
  testimonialQuote: string;
  testimonialAuthor: string;
  faq: Array<{ question: string; answer: string }>;
  theme: {
    accent: string;
    background: 'light' | 'dark';
    styleTone: string;
  };
};

type GenerateCopyResult = {
  copy?: string;
  message?: string;
};

const FALLBACK_THEME = {
  accent: '#4f46e5',
  background: 'light' as const,
  styleTone: 'clean minimal',
};

function normalizeHexColor(value: string | undefined) {
  const cleaned = value?.trim() ?? '';
  return /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : FALLBACK_THEME.accent;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ensureBullets(items: string[] | undefined, fallback: string) {
  const safeItems = (items ?? []).map((item) => item.trim()).filter(Boolean);
  if (safeItems.length > 0) return safeItems.slice(0, 4);
  return [fallback];
}

function normalizeSpec(input: Partial<LandingPageSpec>, body: Required<GenerateCopyPayload>): LandingPageSpec {
  const fallbackSections: LandingPageSection[] = [
    {
      title: 'Masalah yang sering terjadi',
      body: `Banyak ${body.target} kesulitan mendapatkan hasil konsisten tanpa sistem yang jelas.`,
      bullets: ['Waktu habis untuk trial and error', 'Sulit menemukan strategi yang cocok'],
    },
    {
      title: 'Solusi yang ditawarkan',
      body: `${body.product} membantu ${body.target} dengan proses yang lebih cepat dan terarah.`,
      bullets: ensureBullets(body.benefit.split(/[\n,]/), body.benefit),
    },
    {
      title: 'Kenapa wajib ambil sekarang',
      body: 'Mulai sekarang supaya hasil penjualan dan komisi bisa naik lebih cepat.',
      bullets: ['Langsung bisa dipraktikkan', 'Fokus ke hasil yang terukur'],
    },
  ];

  const normalizedSections = (input.sections ?? [])
    .map((section) => ({
      title: section?.title?.trim() || '',
      body: section?.body?.trim() || '',
      bullets: ensureBullets(section?.bullets, body.benefit),
    }))
    .filter((section) => section.title && section.body)
    .slice(0, 4);

  const safeSections = normalizedSections.length > 0 ? normalizedSections : fallbackSections;

  return {
    brandName: input.brandName?.trim() || body.product,
    heroHeadline: input.heroHeadline?.trim() || `${body.product}: solusi praktis untuk ${body.target}`,
    heroSubheadline:
      input.heroSubheadline?.trim() || `Dapatkan manfaat utama: ${body.benefit}. Siap pakai untuk percepat konversi.`,
    primaryCta: input.primaryCta?.trim() || 'Ambil Sekarang',
    secondaryCta: input.secondaryCta?.trim() || 'Lihat Detail',
    sections: safeSections,
    testimonialQuote:
      input.testimonialQuote?.trim() || `“Akhirnya saya punya cara yang lebih jelas untuk mencapai ${body.benefit}.”`,
    testimonialAuthor: input.testimonialAuthor?.trim() || 'Seller/Affiliator Indonesia',
    faq: (input.faq ?? [])
      .map((faq) => ({ question: faq?.question?.trim() || '', answer: faq?.answer?.trim() || '' }))
      .filter((faq) => faq.question && faq.answer)
      .slice(0, 3),
    theme: {
      accent: normalizeHexColor(input.theme?.accent),
      background: input.theme?.background === 'dark' ? 'dark' : 'light',
      styleTone: input.theme?.styleTone?.trim() || FALLBACK_THEME.styleTone,
    },
  };
}

function buildLandingPageHtml(spec: LandingPageSpec, body: Required<GenerateCopyPayload>) {
  const accent = normalizeHexColor(spec.theme.accent);
  const isDark = spec.theme.background === 'dark';
  const pageBg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#111827' : '#ffffff';
  const textColor = isDark ? '#e5e7eb' : '#0f172a';
  const mutedColor = isDark ? '#94a3b8' : '#475569';

  const sectionHtml = spec.sections
    .map(
      (section) => `
      <section class="card section-card">
        <h3>${escapeHtml(section.title)}</h3>
        <p>${escapeHtml(section.body)}</p>
        <ul>
          ${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}
        </ul>
      </section>`,
    )
    .join('');

  const faqHtml =
    spec.faq.length > 0
      ? `<section class="card faq-card"><h3>FAQ</h3>${spec.faq
          .map(
            (item) => `<div><h4>${escapeHtml(item.question)}</h4><p>${escapeHtml(item.answer)}</p></div>`,
          )
          .join('')}</section>`
      : '';

  return `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(spec.brandName)} - Landing Page</title>
    <style>
      :root { --accent: ${accent}; --page-bg: ${pageBg}; --card-bg: ${cardBg}; --text: ${textColor}; --muted: ${mutedColor}; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Inter, Arial, sans-serif; background: var(--page-bg); color: var(--text); }
      .container { max-width: 960px; margin: 0 auto; padding: 32px 20px 48px; display: grid; gap: 16px; }
      .card { background: var(--card-bg); border-radius: 16px; padding: 24px; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08); }
      .hero h1 { margin: 0 0 10px; font-size: 34px; line-height: 1.2; }
      .hero p { margin: 0; color: var(--muted); }
      .cta { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 10px; }
      .btn { border: 0; padding: 12px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; }
      .btn-primary { background: var(--accent); color: white; }
      .btn-secondary { background: transparent; color: var(--accent); border: 1px solid var(--accent); }
      .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
      .section-card h3, .faq-card h3 { margin: 0 0 8px; }
      .section-card p, .faq-card p { color: var(--muted); margin: 0 0 10px; }
      ul { margin: 0; padding-left: 20px; color: var(--muted); }
      .testimonial blockquote { margin: 0; font-size: 20px; line-height: 1.4; }
      .testimonial cite { display: block; margin-top: 12px; color: var(--muted); font-style: normal; }
      .footer { text-align: center; color: var(--muted); font-size: 13px; }
    </style>
  </head>
  <body>
    <main class="container" data-style-tone="${escapeHtml(spec.theme.styleTone)}">
      <section class="card hero">
        <small>${escapeHtml(spec.brandName)} · Template Landing Page Seller/Affiliator</small>
        <h1>${escapeHtml(spec.heroHeadline)}</h1>
        <p>${escapeHtml(spec.heroSubheadline)}</p>
        <div class="cta">
          <button class="btn btn-primary">${escapeHtml(spec.primaryCta)}</button>
          <button class="btn btn-secondary">${escapeHtml(spec.secondaryCta)}</button>
        </div>
      </section>

      <section class="grid">
        ${sectionHtml}
      </section>

      <section class="card testimonial">
        <blockquote>${escapeHtml(spec.testimonialQuote)}</blockquote>
        <cite>${escapeHtml(spec.testimonialAuthor)}</cite>
      </section>

      ${faqHtml}

      <section class="footer">
        Dibuat otomatis untuk produk ${escapeHtml(body.product)} dengan target ${escapeHtml(body.target)}.
      </section>
    </main>
  </body>
</html>`;
}

function extractJson(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function tryParseJsonObject(raw: string) {
  const normalizedRaw = extractJson(raw)
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
  const parseCandidates = [normalizedRaw];
  const objectStart = normalizedRaw.indexOf('{');
  const objectEnd = normalizedRaw.lastIndexOf('}');

  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    parseCandidates.push(normalizedRaw.slice(objectStart, objectEnd + 1));
  }

  for (const candidate of parseCandidates) {
    try {
      return JSON.parse(candidate) as Partial<LandingPageSpec>;
    } catch {
      continue;
    }
  }

  return null;
}

function buildPrompt(body: Required<GenerateCopyPayload>) {
  return [
    'Kamu adalah AI landing page strategist untuk seller dan affiliator Indonesia.',
    'Kamu WAJIB menghasilkan JSON valid (tanpa markdown tambahan) agar server bisa merender ke template landing page universal.',
    'Fokuskan jawaban pada COPY + STYLE BRIEF saja, jangan buat HTML/CSS.',
    'Struktur JSON wajib:',
    '{',
    '  "brandName": "string",',
    '  "heroHeadline": "string",',
    '  "heroSubheadline": "string",',
    '  "primaryCta": "string",',
    '  "secondaryCta": "string",',
    '  "sections": [',
    '    { "title": "string", "body": "string", "bullets": ["string", "string"] }',
    '  ],',
    '  "testimonialQuote": "string",',
    '  "testimonialAuthor": "string",',
    '  "faq": [',
    '    { "question": "string", "answer": "string" }',
    '  ],',
    '  "theme": {',
    '    "accent": "#RRGGBB",',
    '    "background": "light atau dark",',
    '    "styleTone": "deskripsi singkat tone visual"',
    '  }',
    '}',
    '',
    'Aturan penting:',
    '- sections ideal 3 item, maksimal 4.',
    '- bullets setiap section minimal 2, maksimal 4.',
    '- faq ideal 2 item, maksimal 3.',
    '- Bahasa Indonesia, persuasif, tanpa klaim berlebihan.',
    '- Semua teks harus spesifik, jangan gunakan placeholder.',
    '',
    `Produk: ${body.product}`,
    `Target audiens: ${body.target}`,
    `Manfaat utama: ${body.benefit}`,
    `Preferensi gaya visual/gambar: ${body.images}`,
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
          temperature: 0.6,
          topP: 0.9,
          maxOutputTokens: 1000,
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

  const responseText = raw?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n').trim();

  if (!responseText) {
    return {
      ok: false,
      status: 502,
      result: { message: 'Gemini tidak mengembalikan copy yang valid.' } as GenerateCopyResult,
    };
  }

  const parsedSpec = tryParseJsonObject(responseText);
  if (!parsedSpec) {
    const fallbackSpec = normalizeSpec({}, body);
    const copy = buildLandingPageHtml(fallbackSpec, body);
    return {
      ok: true,
      status: 200,
      result: { copy } as GenerateCopyResult,
    };
  }

  const normalizedSpec = normalizeSpec(parsedSpec, body);
  const copy = buildLandingPageHtml(normalizedSpec, body);

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
