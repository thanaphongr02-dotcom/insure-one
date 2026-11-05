# INSURE ONE — Prelaunch verification

This document is a test plan, **not** evidence that any test passed.

## SQL order
1. `supabase/migrations/20261105_insurer_partnerships.sql`
2. `supabase/migrations/20261106_insurer_partnerships_hardening.sql`
3. `supabase/migrations/20261107_block_unverified_offers.sql`

Run in a controlled Supabase environment after backing up and reviewing existing policies/triggers. The migrations are not yet applied.

## Manual acceptance tests
- Anonymous: cannot read partnership records or customer quote requests.
- Member A: can create and read only their own quote requests; cannot view member B's records.
- Member B: cannot read or edit member A's quote.
- Non-admin: cannot read partnership records or list all leads.
- Admin: can view quote requests and update lead statuses.
- Admin: can change prospect from contacting to negotiating; cannot mark signed in browser.
- Admin: can create internal offer draft but cannot send unverified insurer offer.
- Member: cannot create/update insurer offers or insurance orders.
- Any client: cannot mark payment confirmed or policy issued without verified provider workflow.
- User submits quote: it appears in admin dashboard; confirmation says it is not an insurance purchase.
- Confirm privacy notice, complaint contact and retention before public launch.

## Build and deploy gates
- `npm ci`
- `npm run build`
- Inspect Next.js and Supabase errors; test routes /quote, /admin, /admin/insurers and /api/insurance/carriers
- Verify production environment variables and secure service credentials (never NEXT_PUBLIC_)
- Test against staging database before production migration
- Merge reviewed PR, deploy preview, smoke test, then production release

Do not enable payment, insurer quotes, commission recognition or policy issuance until authorized and independently tested.
