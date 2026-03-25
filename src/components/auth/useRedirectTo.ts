export function buildRedirectTo(nextPath: '/dashboard' | '/workspace') {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const callbackUrl = new URL('/auth/callback', origin);
  callbackUrl.searchParams.set('next', nextPath);
  return callbackUrl.toString();
}
