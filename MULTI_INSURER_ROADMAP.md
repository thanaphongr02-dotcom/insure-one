# INSURE ONE — multi-insurer, all-category roadmap

## Target operating model
A scalable catalog that can hold any insurer and insurance line, but enables sales only for insurer-product combinations whose authority and integration have been verified. Individual non-life insurance agent authorization is not a blanket license to broker every insurer or sell life insurance.

## Current phase: public service, not binding online sale
- Registration, quote requests, member tracking and admin operations.
- Show categories as informational; do not represent unapproved insurer appointments.
- The checkout endpoint is deliberately disabled pending a verified payment provider.
- Do not present an accepted quote as paid or covered.

## Required data model in a reviewed future migration
- insurers: canonical legal name, regulatory identifier, verification status.
- insurer_appointments: insurer, agent or licensed entity, scope, evidence reference, verified by, effective and expiry dates.
- product_catalog: insurer, line, approved wording, price/quote source, sale mode and publication status.
- product_authorizations: product, applicable license type, permitted channels, insurer approval and expiry.
- payment_providers: approved merchant account and permitted methods (no secrets in database rows exposed to browsers).
- payment_attempts: order, provider, provider payment ID, expected amount/currency, idempotency key and state.
- payment_events: immutable provider event IDs, verified signatures, timestamp and processing result.
- issuance_events: insurer reference, verification evidence and issuance status.
- audit_log: actor, action, target, old/new state, timestamp and immutable evidence reference.

## Mandatory authorization gate
1. Verify the logged-in customer owns the quote/order.
2. Verify active insurer appointment and product authorization.
3. Verify appropriate insurance license scope (life and non-life separately).
4. Verify the selected payment method is permitted for this insurer/product.
5. Read amount and currency server-side from a valid accepted offer.
6. Only provider-verified events can confirm payment.
7. Only insurer-verified events can mark a policy issued.
8. All state changes must be enforced server-side and in database privileges, not just hidden in UI.

## Staged launch
1. Public information and lead/quote request workflow.
2. Insurer-authorized assisted sales, customer pays using insurer's verified official channel.
3. Provider sandbox checkout, webhook validation and two-account RLS tests.
4. Production checkout only after merchant approval, insurer approval and operational/legal review.
5. Additional insurers and insurance lines added by configuration and documented authorization.

## Not yet completed
Live merchant onboarding, provider credentials, signed webhook implementation, database permission hardening, insurer issuance integration, staging end-to-end testing and production deployment verification.
