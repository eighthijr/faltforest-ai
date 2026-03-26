import crypto from 'crypto';

type AdminSessionPayload = {
  username: string;
  exp: number;
};

const COOKIE_NAME = 'ff_admin_session';
const SESSION_DURATION_SEC = 60 * 60 * 8;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

function encodeBase64Url(value: Buffer | string): string {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function decodeBase64Url(value: string): Buffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  return Buffer.from(padded, 'base64');
}

function signPayload(payload: AdminSessionPayload): string {
  const secret = requireEnv('ADMIN_SESSION_SECRET');
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', secret).update(encodedPayload).digest();
  return `${encodedPayload}.${encodeBase64Url(signature)}`;
}

export function verifySession(token: string | undefined): AdminSessionPayload | null {
  if (!token) return null;

  const [encodedPayload, encodedSignature] = token.split('.');
  if (!encodedPayload || !encodedSignature) return null;

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;

  const expectedSignature = crypto.createHmac('sha256', secret).update(encodedPayload).digest();
  const actualSignature = decodeBase64Url(encodedSignature);

  if (expectedSignature.length !== actualSignature.length) return null;
  if (!crypto.timingSafeEqual(expectedSignature, actualSignature)) return null;

  try {
    const parsed = JSON.parse(decodeBase64Url(encodedPayload).toString('utf8')) as AdminSessionPayload;
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function createSessionToken(username: string): string {
  const payload: AdminSessionPayload = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SEC,
  };

  return signPayload(payload);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function validateAdminCredential(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) return false;

  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

export function getAdminActorId(): string {
  return requireEnv('ADMIN_USER_ID');
}
