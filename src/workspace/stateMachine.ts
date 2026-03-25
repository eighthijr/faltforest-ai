import type { WorkspaceContext, WorkspaceEvent, WorkspaceState } from '../types/workspace';

export const questionOrder = ['product', 'target', 'benefit', 'images'] as const;

export const questionLabels: Record<(typeof questionOrder)[number], string> = {
  product: 'Apa produk yang kamu jual?',
  target: 'Siapa target pembeli utamamu?',
  benefit: 'Apa manfaat utama produk ini?',
  images: 'Masukkan link gambar produk (boleh lebih dari satu, pisahkan koma).',
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
