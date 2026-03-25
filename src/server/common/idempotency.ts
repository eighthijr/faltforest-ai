import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { AppError } from './errors';

type Scope = 'payment:manual:create' | 'payment:tripay:create' | 'project:create';

export async function getIdempotentResponse(scope: Scope, idempotencyKey?: string | null) {
  if (!idempotencyKey) return null;

  const { data, error } = await supabaseAdmin
    .from('api_idempotency_keys')
    .select('request_hash,response')
    .eq('scope', scope)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (error) throw new AppError('IDEMPOTENCY_READ_FAILED', error.message, 500);
  return data ?? null;
}

export async function saveIdempotentResponse(
  scope: Scope,
  idempotencyKey: string | null | undefined,
  requestHash: string,
  response: Record<string, unknown>,
) {
  if (!idempotencyKey) return;

  const existing = await getIdempotentResponse(scope, idempotencyKey);
  if (existing?.request_hash && existing.request_hash !== requestHash) {
    throw new AppError(
      'IDEMPOTENCY_KEY_REUSED',
      'Idempotency key sudah dipakai untuk payload berbeda.',
      409,
    );
  }

  const { error } = await supabaseAdmin.from('api_idempotency_keys').upsert(
    {
      scope,
      idempotency_key: idempotencyKey,
      request_hash: requestHash,
      response,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'scope,idempotency_key' },
  );

  if (error) throw new AppError('IDEMPOTENCY_WRITE_FAILED', error.message, 500);
}
