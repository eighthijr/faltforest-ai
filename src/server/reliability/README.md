# Reliability Hardening Notes

## DB constraints
- payment status transition guard trigger (`trg_guard_payment_status_transition`)
- `payments_success_has_confirmation` check
- ownership function `assert_project_ownership`
- paywall function `enforce_paywall_action`
- race-safe `create_project_atomic` with advisory transaction lock

## Race-condition prevention
- `create_project_atomic` uses `pg_advisory_xact_lock`
- free-project check and insert happen in one DB transaction
- webhook processing dedupes by `(provider, event_id)`

## Idempotency
- table: `api_idempotency_keys`
- payment create endpoints use `x-idempotency-key`
- request replay returns cached response

## Ownership validation
- payment create validates project ownership via `assert_project_ownership`
- manual confirmation verifies payment owner
- workspace actions are checked with DB paywall+ownership function

## Server-side paywall
- free projects are blocked for:
  - `download`
  - `chat_after_generation`
  - `revision`
  when project status is `generated`

## Logging
- project creation (`project_creation`)
- payment (`payment_created`, `payment_waiting_confirmation`, `payment_admin_decision`)
- webhook (`webhook_processed`, `webhook_failed`)

## Edge cases handled
- duplicated client submits (idempotency key)
- webhook replay
- invalid status transitions
- ownership mismatch
- paywall bypass attempts
