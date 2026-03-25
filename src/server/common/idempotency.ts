import { supabase } from '../../lib/supabaseClient';

type Scope = 'payment:manual:create' | 'payment:tripay:create' | 'project:create';

export async function getIdempotentResponse(scope: Scope, idempotencyKey?: string | null) {
  if (!idempotencyKey) return null;

  const { data, error } = await supabase
    .from('api_idempotency_keys')
    .select('response')
    .eq('scope', scope)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.response ?? null;
}

export async function saveIdempotentResponse(
  scope: Scope,
  idempotencyKey: string | null | undefined,
  requestHash: string,
  response: Record<string, unknown>,
) {
  if (!idempotencyKey) return;

  const { error } = await supabase.from('api_idempotency_keys').upsert(
    {
      scope,
      idempotency_key: idempotencyKey,
      request_hash: requestHash,
      response,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'scope,idempotency_key' },
  );

  if (error) throw new Error(error.message);
}
