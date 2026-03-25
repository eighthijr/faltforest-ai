import { NextRequest, NextResponse } from 'next/server';

export function getRequestUser(req: NextRequest) {
  const id = req.headers.get('x-user-id') ?? undefined;
  const role = req.headers.get('x-user-role') ?? undefined;
  return id ? { id, role } : undefined;
}

export function toNextResponse(result: { status: number; body: unknown }) {
  return NextResponse.json(result.body, { status: result.status });
}
