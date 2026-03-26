import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, getAdminCookieName, validateAdminCredential } from '@/server/admin/auth';

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { username?: string; password?: string } | null;
  const username = body?.username?.trim() ?? '';
  const password = body?.password ?? '';

  if (!username || !password) {
    return NextResponse.json({ message: 'Username dan password wajib diisi.' }, { status: 400 });
  }

  if (!validateAdminCredential(username, password)) {
    return NextResponse.json({ message: 'Credential admin tidak valid.' }, { status: 401 });
  }

  const token = createSessionToken(username);
  const response = NextResponse.json({ ok: true });

  response.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
