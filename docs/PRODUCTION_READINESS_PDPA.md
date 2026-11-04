# INSURE ONE — Production Readiness & PDPA Gap Register

Status: **NOT APPROVED FOR LIVE INSURANCE SALES**. This is an engineering checklist, not legal certification. Review against the actual insurer agreements, OIC requirements, Thai PDPA, and payment provider contracts.

## Confirmed from repository review (2026-11)
- Next.js 14 application, Supabase client, member and admin pages, products, quotations, orders, private policy PDF workflow.
- `app/admin/orders/page.tsx` uses a browser confirmation and manually sets `payment_confirmed_at`; **no verified payment gateway callback is shown in that workflow**.
- Policy PDFs are uploaded manually after an order is marked `policy_issued`; this does not prove insurer API integration or coverage commencement.
- `app/register/page.tsx` collects name, email and phone, requiring an appropriate privacy notice and retention process.
- Admin page reads `admin_users` client-side; **actual authorization must be enforced by database RLS and/or trusted server code**, not UI checks.
- The order UI now locks an existing policy number and warns about unconfirmed payments. Confirmed by reviewing the latest GitHub file.

## P0 — Must be completed before live transactions
- [ ] Confirm each insurer's written authorization: eligible products, electronic solicitation, premium collection, permitted marketing, policy delivery and use of branding.
- [ ] Document the data-controller/processor roles and lawful basis for each purpose, especially sensitive health information.
- [ ] Publish a reviewed Thai privacy notice before collecting personal data; provide a contact and a DSAR workflow (access, correction, objection, withdrawal where applicable, erasure when lawful).
- [ ] Establish a retention/deletion schedule, processor agreements, cross-border transfer assessment where relevant, and breach response workflow.
- [ ] Verify RLS policies for all tables and storage objects with **member A/member B/admin/anonymous** negative tests; never expose service-role secrets to the browser.
- [ ] Restrict payment confirmation to a trusted server-side action after independently verifying provider transaction reference, amount, currency, order identity, and idempotency. Do not treat a browser confirm as payment verification.
- [ ] Use insurer-authorized payment collection or hosted checkout; never store card PAN/CVV.
- [ ] Verify policy issuance and effective dates with the insurer; preserve existing real policy numbers and historical records.
- [ ] Run threat modeling, dependency scan, security testing, backups and restore drill, and incident response tabletop.
- [ ] Verify MFA for privileged users and immutable audit trails for financial/policy changes.

## P1 — Operational completeness
- [ ] Product eligibility, exclusions, source of prices, effective dates, versioned disclosures, acceptance evidence.
- [ ] Payment reconciliation, refunds/chargebacks, duplicate callback protection, failure recovery.
- [ ] Document verification, access logs, signed downloads, customer notifications.
- [ ] Customer service, renewal and complaint workflows, accessibility, monitoring and alerting.
- [ ] Tests: unit, integration, RLS, UAT, load, rollback and deployment gate.

## Safe delivery strategy
1. Work on feature branches and open reviewable PRs; do not directly overwrite `main`.
2. Back up production schema and verify staging environment. Do not run destructive migrations on real orders.
3. Build PDPA screens and backend request/audit models with migration scripts **reviewed before execution**.
4. Implement payment/insurer adapters only after receiving documented API access and authorizations.
5. Run `npm run build`, tests, security checks and human review before merge/deploy.

## Critical current order invariant
An existing order may have a genuine insurer-issued policy number while payment remains unconfirmed. Never infer paid/active status from the policy number. Never overwrite it or change `payment_confirmed_at`, `policy_issued_at`, or `policy_document_url` as part of a migration or test.

## External approvals required
- Insurer integration and permission scope
- Authorized payment provider integration and settlement flow
- Thai legal/PDPA review, OIC compliance review
- Independent security testing appropriate to risk

**Release gate:** no live payment/policy issuance until these P0 items are verified with evidence.
