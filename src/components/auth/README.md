# Supabase Auth Modal Integration

## What this provides

- **Google OAuth** via `supabase.auth.signInWithOAuth({ provider: 'google' })`
- **Email + Password** login and sign-up
- **Modal-based UI** (`AuthModal`) instead of a dedicated auth page
- **Redirect handling** with `redirectTo` for OAuth + email confirmation flows

## Redirect flows implemented

- Login entry point -> redirect to `/dashboard`
- CTA entry point -> redirect to `/workspace`

`buildRedirectTo()` sends users to `/auth/callback?next=/dashboard|/workspace`, and `AuthCallback` then sends users to the final destination.

## Quick usage

```tsx
import { AuthEntryPoints, AuthCallback } from './components/auth';

// In your landing/header component:
<AuthEntryPoints />

// In your router:
<Route path="/auth/callback" element={<AuthCallback />} />
```

## Environment variables

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
