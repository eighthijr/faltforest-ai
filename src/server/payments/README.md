# Payment System Backend

## Modes

1. **Manual QRIS**
   - user create payment (`pending`)
   - user click **"Saya sudah bayar"** -> `waiting_confirmation`
   - admin approve/reject -> `success` / `rejected`

2. **Tripay QRIS**
   - create transaction ke Tripay
   - webhook Tripay update status payment

## Critical guarantees

- **Idempotent**
  - `payments.reference` unik
  - webhook events disimpan di `payment_webhook_events` dengan unique `(provider, event_id)`
- **Transactional**
  - status transition diproses dalam Postgres function (single transaction)
- **Only webhook/admin can mark success**
  - `success` hanya di `admin_decide_manual_payment()` atau `process_tripay_webhook()`

## API routes

- `postManualQrisCreate`
- `postManualQrisAlreadyPaid`
- `postManualQrisAdminDecision` (admin only)
- `postTripayQrisCreate`
- `postTripayWebhook` (signature verified)

## Notes

- webhook signature pakai `x-callback-signature` dan diverifikasi HMAC SHA-256
- contoh migration: `db/migrations/20260325_payment_system.sql`
