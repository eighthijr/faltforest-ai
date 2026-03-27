import { NextResponse } from 'next/server';

const QRIS_PATH = 'manual-qris/current.png';
const QRIS_BUCKET = process.env.NEXT_PUBLIC_QRIS_BUCKET || 'payment-assets';

function buildPublicUrl() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return '';
  return `${base}/storage/v1/object/public/${QRIS_BUCKET}/${QRIS_PATH}`;
}

export async function GET() {
  return NextResponse.json({ imageUrl: buildPublicUrl() });
}
