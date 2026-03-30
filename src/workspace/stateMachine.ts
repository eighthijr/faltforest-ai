import type { WorkspaceContext, WorkspaceEvent, WorkspaceState } from '../types/workspace';

export const questionOrder = ['product', 'target', 'problem', 'benefit', 'offer', 'cta', 'whatsapp', 'images', 'style'] as const;

export const questionLabels: Record<(typeof questionOrder)[number], string> = {
  product: 'Apa produk yang kamu jual?',
  target: 'Siapa target pembeli utamamu?',
  problem: 'Masalah utama apa yang paling sering dialami target kamu?',
  benefit: 'Apa hasil/manfaat utama yang dijanjikan?',
  offer: 'Apa penawaran yang ingin ditonjolkan? (harga, bonus, garansi, promo)',
  cta: 'User nanti diarahkan ke mana? (contoh: chat WA, daftar form, checkout)',
  whatsapp: 'Masukkan nomor WhatsApp tujuan (format internasional tanpa +, contoh 62812xxxx).',
  images: 'Masukkan link gambar (produk, testimoni, logo) dipisahkan koma. Jika belum ada, ketik "tidak ada".',
  style: 'Gaya visual yang diinginkan apa? (contoh: clean, luxury dark, fun colorful)',
};

export function canTransition(current: WorkspaceState, next: WorkspaceState): boolean {
  if (current === 'draft' && next === 'ready') return true;
  if (current === 'ready' && next === 'generated') return true;
  return false;
}

export function reduceWorkspace(context: WorkspaceContext, event: WorkspaceEvent): WorkspaceContext {
  switch (event.type) {
    case 'ANSWER_SUBMITTED': {
      if (context.state !== 'draft') return context;
      return {
        ...context,
        answers: {
          ...context.answers,
          [event.key]: event.value,
        },
      };
    }

    case 'COLLECTION_COMPLETED': {
      if (!canTransition(context.state, 'ready')) return context;
      return {
        ...context,
        state: 'ready',
      };
    }

    case 'GENERATION_SUCCEEDED': {
      if (!canTransition(context.state, 'generated')) return context;
      return {
        ...context,
        state: 'generated',
        generatedCopy: event.copy,
        hasGeneratedOnce: true,
      };
    }

    case 'GENERATION_FAILED':
      return {
        ...context,
        state: 'ready',
      };

    case 'RESET_DRAFT': {
      if (context.projectType === 'free' && context.hasGeneratedOnce) {
        return context;
      }

      return {
        ...context,
        state: 'draft',
        generatedCopy: null,
      };
    }

    default:
      return context;
  }
}

export function getMissingFields(context: WorkspaceContext) {
  return questionOrder.filter((key) => !context.answers[key]?.trim());
}
