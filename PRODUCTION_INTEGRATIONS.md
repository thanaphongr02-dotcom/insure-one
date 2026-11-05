# INSURE ONE — Production integration contract

## Current functionality
- Supabase Auth for registration and login.
- Member quote requests, admin offers, member acceptance/decline via `respond_to_insurance_offer`.
- Admin creation of an order from an accepted offer.
- Order status timeline and private policy PDF storage (bucket `insurance-policies`).
- The admin UI intentionally blocks manually marking payments as confirmed or policies as issued until a verified integration exists. **This is UI-only**: database-level enforcement is still required.

## Do not launch real transactions until these are complete
1. Confirm legal sales authorization and exact insurer products and issuance process. Never display fabricated partnerships or coverage.
2. Choose the licensed/approved payment provider and obtain sandbox API credentials, callback signature specification, merchant identifiers and settlement account.
3. Implement server-only webhook endpoint that verifies provider signature and event authenticity, checks amount, currency, merchant, order, duplicate event ID and actual provider status. Never trust client-supplied payment references or timestamps.
4. Add a server-side, authenticated order state transition service. Ordinary browser/admin sessions must not be able to set `payment_confirmed_at`, `payment_reference`, `policy_issued_at`, `policy_number` or advance to `payment_confirmed` / `policy_issued` by direct API UPDATE. Use least-privilege DB function/service credentials and keep secrets out of `NEXT_PUBLIC_*`.
5. Require an accepted offer and verified offer/quote relationship before order creation. Review existing RLS, triggers and grants; make schema changes as reviewed migrations, with rollback and staging tests.
6. Obtain insurer issuance API or documented authorized manual verification workflow. Do not mark `policy_issued` without independent confirmation.
7. Audit policy-document access with two separate test customer accounts. Bucket must stay private; storage path must match `insurance_orders.policy_document_url`.
8. Test payment replay, spoofed callback, wrong amount, unauthorized user, cancellation, expired offer, concurrent updates, refund/failure, webhook retry and orphaned uploaded files.
9. Complete privacy notice, consent, retention, incident handling and support channels appropriate to operation.

## Existing order states
`awaiting_payment_channel` → `awaiting_payment_confirmation` → `payment_confirmed` → `awaiting_policy` → `policy_issued`; cancellation permitted from the first two stages.

## Required external inputs
- Payment provider name and developer documentation / sandbox keys (never paste secret keys into chat or commit).
- Insurer-approved product list and integration method or authorized manual process.
- Production domain, merchant registration details and approved support contacts.

## Safe next development tasks
- Build payment adapter interface and webhook signature verification only after provider is selected.
- Prepare staging database migration to remove browser ability to confirm payments/issuance.
- Run end-to-end tests on staging with sandbox credentials and test users.
