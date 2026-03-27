import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

type RequestUser = { id: string; role?: string };

function normalizeRole(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined;
  const value = input.trim();
  return value || undefined;
}

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

  const appRole = normalizeRole(data.user.user_metadata?.role) ?? normalizeRole(data.user.app_metadata?.role);

  return { id: data.user.id, role: appRole };
}

export function toNextResponse(result: { status: number; body: unknown }) {
  return NextResponse.json(result.body, { status: result.status });
}
