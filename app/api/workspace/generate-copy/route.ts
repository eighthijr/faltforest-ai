import { NextRequest, NextResponse } from 'next/server';

type GenerateCopyPayload = {
  projectId?: string;
  product?: string;
  target?: string;
  problem?: string;
  benefit?: string;
  offer?: string;
  cta?: string;
  whatsapp?: string;
  images?: string;
  style?: string;
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
  whatsappCtaLabel: string;
  trustChips: string[];
  stats: Array<{ label: string; value: string }>;
  sections: LandingPageSection[];
  offer: {
    title: string;
    priceLabel: string;
    includes: string[];
    urgency: string;
    guarantee: string;
  };
  testimonialQuote: string;
  testimonialAuthor: string;
  faq: Array<{ question: string; answer: string }>;
  imageUrls: string[];
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

function parseImageUrls(rawValue: string | undefined) {
  const candidates = (rawValue ?? '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (candidates.some((item) => item.toLowerCase() === 'tidak ada')) return [];
  return candidates.filter((item) => /^https?:\/\/\S+/i.test(item) || /^data:image\/[a-zA-Z]+;base64,/i.test(item)).slice(0, 6);
}

function summarizeImagePreference(rawValue: string | undefined) {
  const urls = parseImageUrls(rawValue);
  const remoteCount = urls.filter((item) => item.startsWith('http')).length;
  const uploadedCount = urls.filter((item) => item.startsWith('data:image')).length;

  if (urls.length === 0) return rawValue ?? '';
  return `Total gambar: ${urls.length} (URL publik: ${remoteCount}, upload lokal: ${uploadedCount})`;
}

function normalizeSpec(input: Partial<LandingPageSpec>, body: Required<GenerateCopyPayload>): LandingPageSpec {
  const fallbackSections: LandingPageSection[] = [
    {
      title: 'Masalah yang sering terjadi',
      body: body.problem,
      bullets: ['Masalah ini menahan pertumbuhan penjualan', 'Sulit diselesaikan tanpa strategi yang tepat'],
    },
    {
      title: 'Solusi yang ditawarkan',
      body: `${body.product} membantu ${body.target} dengan proses yang lebih cepat dan terarah.`,
      bullets: ensureBullets(body.benefit.split(/[\n,]/), body.benefit),
    },
    {
      title: 'Penawaran untuk kamu',
      body: body.offer,
      bullets: ['Penawaran dirancang untuk mempercepat keputusan beli', 'Cocok untuk target yang butuh hasil cepat'],
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
  const normalizedImageUrls = (input.imageUrls ?? [])
    .filter((item) => /^https?:\/\/\S+/i.test(item) || /^data:image\/[a-zA-Z]+;base64,/i.test(item))
    .slice(0, 6);
  const fallbackImageUrls = parseImageUrls(body.images);
  const offerIncludes = ensureBullets(input.offer?.includes, body.offer);

  return {
    brandName: input.brandName?.trim() || body.product,
    heroHeadline: input.heroHeadline?.trim() || `${body.product}: solusi praktis untuk ${body.target}`,
    heroSubheadline:
      input.heroSubheadline?.trim() || `Dapatkan manfaat utama: ${body.benefit}. Siap pakai untuk percepat konversi.`,
    primaryCta: input.primaryCta?.trim() || 'Konsultasi Sekarang',
    secondaryCta: input.secondaryCta?.trim() || body.cta,
    whatsappCtaLabel: input.whatsappCtaLabel?.trim() || 'Chat via WhatsApp',
    trustChips: ensureBullets(input.trustChips, 'Tanpa setup rumit').slice(0, 4),
    stats: (input.stats ?? [])
      .map((stat) => ({ label: stat?.label?.trim() || '', value: stat?.value?.trim() || '' }))
      .filter((stat) => stat.label && stat.value)
      .slice(0, 3),
    sections: safeSections,
    offer: {
      title: input.offer?.title?.trim() || 'Paket yang paling relevan untuk kebutuhanmu',
      priceLabel: input.offer?.priceLabel?.trim() || body.offer,
      includes: offerIncludes,
      urgency: input.offer?.urgency?.trim() || 'Bonus onboarding berlaku terbatas minggu ini.',
      guarantee: input.offer?.guarantee?.trim() || 'Jaminan revisi copy sampai pesan utama terasa pas.',
    },
    testimonialQuote:
      input.testimonialQuote?.trim() || `“Akhirnya saya punya cara yang lebih jelas untuk mencapai ${body.benefit}.”`,
    testimonialAuthor: input.testimonialAuthor?.trim() || 'Seller/Affiliator Indonesia',
    faq: (input.faq ?? [])
      .map((faq) => ({ question: faq?.question?.trim() || '', answer: faq?.answer?.trim() || '' }))
      .filter((faq) => faq.question && faq.answer)
      .slice(0, 3),
    imageUrls: normalizedImageUrls.length > 0 ? normalizedImageUrls : fallbackImageUrls,
    theme: {
      accent: normalizeHexColor(input.theme?.accent),
      background: input.theme?.background === 'dark' ? 'dark' : 'light',
      styleTone: input.theme?.styleTone?.trim() || body.style || FALLBACK_THEME.styleTone,
    },
  };
}

function buildLandingPageHtml(spec: LandingPageSpec, body: Required<GenerateCopyPayload>) {
  const accent = normalizeHexColor(spec.theme.accent);
  const isDark = spec.theme.background === 'dark';
  const whatsappNumber = body.whatsapp.replace(/\D/g, '');
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Halo, saya tertarik dengan ${body.product}`)}` : '#';
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
          ${section.bullets.map((bullet) => `<li><span>✓</span>${escapeHtml(bullet)}</li>`).join('')}
        </ul>
      </section>`,
    )
    .join('');

  const trustChipHtml = spec.trustChips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('');
  const stats = spec.stats.length > 0 ? spec.stats : [{ label: 'Fokus utama', value: 'Konversi & kejelasan pesan' }];
  const statsHtml = stats.map((stat) => `<article><strong>${escapeHtml(stat.value)}</strong><p>${escapeHtml(stat.label)}</p></article>`).join('');

  const faqHtml =
    spec.faq.length > 0
      ? `<section class="card faq-card"><h3>Pertanyaan yang sering muncul</h3>${spec.faq
          .map(
            (item) =>
              `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`,
          )
          .join('')}</section>`
      : '';

  const galleryHtml =
    spec.imageUrls.length > 0
      ? `<section class="card">
          <h3>Galeri Visual</h3>
          <div class="gallery">
            ${spec.imageUrls
              .map(
                (url, index) =>
                  `<figure><img src="${escapeHtml(url)}" alt="Visual ${index + 1} ${escapeHtml(spec.brandName)}" loading="lazy" /></figure>`,
              )
              .join('')}
          </div>
        </section>`
      : '';

  return `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(spec.brandName)} - Landing Page Konversi</title>
    <style>
      :root { --accent: ${accent}; --page-bg: ${pageBg}; --card-bg: ${cardBg}; --text: ${textColor}; --muted: ${mutedColor}; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Inter, Arial, sans-serif; background: var(--page-bg); color: var(--text); }
      .container { max-width: 1140px; margin: 0 auto; padding: 20px 20px 56px; display: grid; gap: 18px; }
      .card { background: var(--card-bg); border-radius: 18px; padding: 24px; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08); }
      .topbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      .brand { font-weight: 800; letter-spacing: 0.02em; }
      .chip-row { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 8px; }
      .chip-row span { font-size: 12px; padding: 6px 10px; border-radius: 999px; background: rgba(79, 70, 229, 0.1); color: var(--accent); font-weight: 600; }
      .hero { display: grid; gap: 14px; }
      .hero h1 { margin: 0 0 10px; font-size: 36px; line-height: 1.15; max-width: 16ch; }
      .hero p { margin: 0; color: var(--muted); max-width: 62ch; }
      .cta { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 10px; }
      .btn { border: 0; padding: 12px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
      .btn-primary { background: var(--accent); color: white; }
      .btn-secondary { background: transparent; color: var(--accent); border: 1px solid var(--accent); }
      .stats-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
      .stats-grid article { border-radius: 14px; padding: 14px; background: rgba(148, 163, 184, 0.12); }
      .stats-grid strong { display: block; font-size: 18px; margin-bottom: 6px; }
      .stats-grid p { margin: 0; font-size: 13px; color: var(--muted); }
      .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
      .section-card h3, .faq-card h3 { margin: 0 0 8px; }
      .section-card p, .faq-card p { color: var(--muted); margin: 0 0 10px; }
      ul { margin: 0; padding-left: 0; list-style: none; color: var(--muted); display: grid; gap: 8px; }
      li { display: flex; align-items: flex-start; gap: 8px; }
      li span { color: var(--accent); font-weight: 700; }
      .offer-card { border: 1px solid rgba(79, 70, 229, 0.3); background: linear-gradient(165deg, rgba(79, 70, 229, 0.12), rgba(79, 70, 229, 0.03)); }
      .offer-card h3 { margin: 0; }
      .offer-price { margin: 8px 0 14px; font-size: 28px; font-weight: 800; }
      .subtle { color: var(--muted); font-size: 13px; margin-top: 10px; }
      .testimonial blockquote { margin: 0; font-size: 22px; line-height: 1.35; }
      .testimonial cite { display: block; margin-top: 12px; color: var(--muted); font-style: normal; }
      .gallery { margin-top: 12px; display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      .gallery figure { margin: 0; overflow: hidden; border-radius: 14px; background: rgba(148, 163, 184, 0.12); min-height: 180px; }
      .gallery img { display: block; width: 100%; height: 100%; object-fit: cover; }
      details { border-top: 1px solid rgba(148, 163, 184, 0.3); padding: 12px 0; }
      details:first-of-type { border-top: 0; padding-top: 0; }
      summary { cursor: pointer; font-weight: 700; }
      .footer { text-align: center; color: var(--muted); font-size: 13px; }
      @media (max-width: 640px) { .hero h1 { font-size: 30px; } .card { padding: 18px; } }
    </style>
  </head>
  <body>
    <main class="container" data-style-tone="${escapeHtml(spec.theme.styleTone)}">
      <section class="card hero">
        <div class="topbar">
          <small class="brand">${escapeHtml(spec.brandName)}</small>
          <small>Template berbasis praktik landing page konversi tinggi</small>
        </div>
        <h1>${escapeHtml(spec.heroHeadline)}</h1>
        <p>${escapeHtml(spec.heroSubheadline)}</p>
        <div class="chip-row">${trustChipHtml}</div>
        <div class="cta">
          <a class="btn btn-primary" href="${escapeHtml(whatsappLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(spec.whatsappCtaLabel)}</a>
          <a class="btn btn-secondary" href="#penawaran">${escapeHtml(spec.secondaryCta || spec.primaryCta)}</a>
        </div>
      </section>

      <section class="stats-grid">
        ${statsHtml}
      </section>

      ${galleryHtml}

      <section class="grid" id="penawaran">
        ${sectionHtml}
        <section class="card offer-card">
          <h3>${escapeHtml(spec.offer.title)}</h3>
          <p class="offer-price">${escapeHtml(spec.offer.priceLabel)}</p>
          <ul>
            ${spec.offer.includes.map((item) => `<li><span>✓</span>${escapeHtml(item)}</li>`).join('')}
          </ul>
          <p class="subtle">${escapeHtml(spec.offer.urgency)}</p>
          <p class="subtle">${escapeHtml(spec.offer.guarantee)}</p>
          <div class="cta">
            <a class="btn btn-primary" href="${escapeHtml(whatsappLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(spec.primaryCta)}</a>
          </div>
        </section>
      </section>

      <section class="card testimonial">
        <blockquote>${escapeHtml(spec.testimonialQuote)}</blockquote>
        <cite>${escapeHtml(spec.testimonialAuthor)}</cite>
      </section>

      ${faqHtml}

      <section class="footer">
        Dibuat otomatis untuk produk ${escapeHtml(body.product)} dengan target ${escapeHtml(body.target)}. CTA utama: ${escapeHtml(
          body.cta,
        )}.
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
    '  "whatsappCtaLabel": "string",',
    '  "trustChips": ["string", "string"],',
    '  "stats": [',
    '    { "label": "string", "value": "string" }',
    '  ],',
    '  "sections": [',
    '    { "title": "string", "body": "string", "bullets": ["string", "string"] }',
    '  ],',
    '  "offer": {',
    '    "title": "string",',
    '    "priceLabel": "string",',
    '    "includes": ["string", "string"],',
    '    "urgency": "string",',
    '    "guarantee": "string"',
    '  },',
    '  "testimonialQuote": "string",',
    '  "testimonialAuthor": "string",',
    '  "faq": [',
    '    { "question": "string", "answer": "string" }',
    '  ],',
    '  "imageUrls": ["https://..."],',
    '  "theme": {',
    '    "accent": "#RRGGBB",',
    '    "background": "light atau dark",',
    '    "styleTone": "deskripsi singkat tone visual"',
    '  }',
    '}',
    '',
    'Aturan penting:',
    '- Bangun copy dengan urutan: value proposition jelas, proof, offer, objection handling, CTA.',
    '- sections ideal 3 item, maksimal 4. Fokus: masalah, solusi, outcome.',
    '- bullets setiap section minimal 2, maksimal 4.',
    '- trustChips 3-4 item (contoh: Tanpa coding, Siap pakai, Support cepat).',
    '- stats 2-3 item dengan angka/klaim yang kredibel tanpa berlebihan.',
    '- offer wajib berisi judul paket, priceLabel, isi paket, urgency, dan guarantee.',
    '- faq ideal 2 item, maksimal 3.',
    '- imageUrls ambil dari input gambar yang valid URL.',
    '- Bahasa Indonesia, persuasif, ringkas, tanpa klaim berlebihan.',
    '- Headline maksimum 14 kata dan harus menyebut hasil utama yang diinginkan target.',
    '- Subheadline menjawab: untuk siapa, masalah apa, dan hasil apa.',
    '- CTA harus memakai kata kerja jelas (contoh: Mulai, Konsultasi, Coba).',
    '- Semua teks harus spesifik, jangan gunakan placeholder.',
    '',
    `Produk: ${body.product}`,
    `Target audiens: ${body.target}`,
    `Problem utama target: ${body.problem}`,
    `Manfaat utama: ${body.benefit}`,
    `Penawaran: ${body.offer}`,
    `Tujuan CTA: ${body.cta}`,
    `Nomor WhatsApp: ${body.whatsapp}`,
    `Preferensi gaya visual/gambar: ${summarizeImagePreference(body.images)}`,
    `Style visual yang diinginkan: ${body.style}`,
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
    const requiredFields: Array<keyof GenerateCopyPayload> = [
      'projectId',
      'product',
      'target',
      'problem',
      'benefit',
      'offer',
      'cta',
      'whatsapp',
      'images',
      'style',
    ];
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
