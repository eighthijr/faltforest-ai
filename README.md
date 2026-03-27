# FLATFOREST AI (Next.js + Supabase + Vercel)

Aplikasi SaaS untuk:
- landing page conversion
- auth (Google + Email/Password)
- dashboard project
- workspace generator
- payment (Manual QRIS + Tripay QRIS)
- analytics dashboard

Sudah dibungkus dalam **Next.js App Router** dan siap deploy ke **Vercel**.

---

## 1) Arsitektur Singkat

- **Frontend**: Next.js App Router (`app/*`)
- **Backend API**: Next.js Route Handlers (`app/api/*`)
- **Database/Auth**: Supabase Postgres + Supabase Auth
- **Payment Gateway**: Tripay (QRIS)
- **Deployment**: Vercel

Folder penting:
- `app/` -> halaman dan API routes Next.js
- `src/components/` -> komponen UI
- `src/server/` -> service logic backend (payments, analytics, projects, workspace)
- `db/supabase_schema.sql` -> schema utama
- `db/migrations/*.sql` -> hardening + payment workflow
- `db/queries/analytics_system.sql` -> query/fungsi analytics

---

## 2) Environment Variables (Wajib)

Buat `.env.local` (untuk lokal) dan set juga di Vercel Project Settings -> Environment Variables.

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Tripay
- `TRIPAY_API_KEY`
- `TRIPAY_PRIVATE_KEY`
- `TRIPAY_MERCHANT_CODE`
- `TRIPAY_CALLBACK_URL`

### Opsional (disarankan)
- `NEXT_PUBLIC_APP_URL` (contoh: `https://your-app.vercel.app`)
- `GEMINI_API_KEY` (jika ingin generate copy langsung dari Next.js route tanpa Supabase Edge Function)
- `GEMINI_MODEL` (opsional, default: `gemini-2.5-flash`)
- `NEXT_PUBLIC_QRIS_BUCKET` (opsional, default: `payment-assets`)

### Environment Admin (untuk /admin)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET` (string random panjang untuk sign cookie session admin)
- `ADMIN_USER_ID` (UUID user admin di Supabase Auth untuk kolom `confirmed_by`)

> Catatan: `SUPABASE_SERVICE_ROLE_KEY` dan `GEMINI_API_KEY` **hanya untuk server**. Jangan expose ke browser.

---

## 3) Setup Supabase (Wajib supaya jalan)

### A. Buat Project Supabase
1. Create new project di Supabase.
2. Ambil `Project URL` dan `anon key` dari Settings -> API.
3. Ambil `service_role key` dari Settings -> API.

### B. Jalankan SQL schema + migration
Jalankan SQL berikut di Supabase SQL Editor (urutan penting):

1. `db/supabase_schema.sql`
2. `db/migrations/20260325_payment_system.sql`
3. `db/migrations/20260325_reliability_hardening.sql`
4. `db/queries/analytics_system.sql`

### C. Konfigurasi Auth
1. Auth -> Providers -> enable **Google**.
2. Isi Google OAuth Client ID/Secret.
3. Tambahkan redirect URL:
   - Lokal: `http://localhost:3000/auth/callback`
   - Production: `https://<domain-anda>/auth/callback`

### D. (Opsional tapi disarankan) RLS Policy
- Pastikan policy sesuai kebutuhan akses user/admin.
- Endpoint backend server menggunakan `SUPABASE_SERVICE_ROLE_KEY`, jadi validasi ownership tetap harus lewat service (sudah diterapkan).

### E. Tripay Webhook
- Set callback URL ke:
  - `https://<domain-anda>/api/payments/tripay/webhook`
- Pastikan signature header `x-callback-signature` dikirim Tripay.

### F. Supabase Storage untuk QRIS Manual
1. Buka **Storage** di dashboard Supabase.
2. Buat bucket bernama `payment-assets` (atau nama lain sesuai `NEXT_PUBLIC_QRIS_BUCKET`).
3. Set bucket sebagai **public** agar URL QRIS bisa ditampilkan di halaman pricing.
4. File QRIS akan disimpan di path: `manual-qris/current.png`.

---

## 4) Jalankan Lokal

```bash
npm install
npm run dev
```

Buka: `http://localhost:3000`

---

## 5) Deploy ke Vercel

1. Push repo ke GitHub/GitLab/Bitbucket.
2. Import project ke Vercel.
3. Set semua env vars di Vercel.
4. Deploy.
5. Update callback URL Google OAuth & Tripay ke domain production.

---

## 6) API Endpoints yang Tersedia

### Projects
- `POST /api/projects/create`

### Workspace
- `POST /api/workspace/guard` (server-side paywall guard)
- `POST /api/workspace/generate-copy` (pakai `GEMINI_API_KEY`; fallback ke Supabase Edge Function jika key tidak diisi)

### Payments
- `POST /api/payments/manual/create`
- `POST /api/payments/manual/already-paid`
- `POST /api/payments/manual/submit-proof` (buat reference otomatis + upload bukti transfer + kirim verifikasi admin)
- `POST /api/payments/manual/admin-decision`
- `POST /api/payments/tripay/create`
- `POST /api/payments/tripay/webhook`

### Analytics
- `POST /api/analytics/track`
- `GET /api/analytics/dashboard?from=...&to=...`

### Admin
- `GET /admin` (login admin + panel)
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/session`
- `GET/POST /api/admin/manual-payments`
- `GET/POST /api/admin/qris-image`

---

## 7) Catatan Penting Produksi

- Pakai `x-idempotency-key` untuk endpoint create payment/project.
- Jangan izinkan status `success` diubah dari client; hanya admin/webhook.
- Logging event penting sudah ada untuk:
  - project creation
  - payment lifecycle
  - webhook events
- Pastikan hanya server yang memakai service role key.

---

## 8) Quick Checklist sebelum Go Live

- [ ] Semua env vars sudah terisi di Vercel
- [ ] Semua SQL sudah dieksekusi di Supabase
- [ ] Google OAuth redirect URL sudah benar
- [ ] Tripay webhook URL & signature sudah tervalidasi
- [ ] Test flow end-to-end:
  - [ ] login
  - [ ] create project
  - [ ] generate
  - [ ] payment manual/tripay
  - [ ] analytics masuk
