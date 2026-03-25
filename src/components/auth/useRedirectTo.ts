export function buildRedirectTo(nextPath: '/dashboard' | '/workspace') {
  const callbackUrl = new URL('/auth/callback', window.location.origin);
  callbackUrl.searchParams.set('next', nextPath);
  return callbackUrl.toString();
}
