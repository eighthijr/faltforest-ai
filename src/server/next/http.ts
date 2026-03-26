import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

type RequestUser = { id: string; role?: string };

export async function getRequestUser(req: NextRequest): Promise<RequestUser | undefined> {
  const headerId = req.headers.get('x-user-id') ?? undefined;
  const role = req.headers.get('x-user-role') ?? undefined;
  if (headerId) return { id: headerId, role };

  const authorization = req.headers.get('authorization');
  if (!authorization?.toLowerCase().startsWith('bearer ')) return undefined;

  const token = authorization.slice(7).trim();
  if (!token) return undefined;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) return undefined;

  const metadataRole = data.user.user_metadata?.role;
  const appRole = typeof metadataRole === 'string' ? metadataRole : undefined;

  return { id: data.user.id, role: appRole };
}

export function toNextResponse(result: { status: number; body: unknown }) {
  return NextResponse.json(result.body, { status: result.status });
}
