const ADMIN_EMAILS = ['abu_ubaidah@flatforest.site'] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail === normalizedEmail);
}

export function resolveUserRole(inputRole: unknown, email: string | null | undefined): string | null {
  if (typeof inputRole === 'string' && inputRole.trim()) {
    return inputRole.trim();
  }

  return isAdminEmail(email) ? 'admin' : null;
}
