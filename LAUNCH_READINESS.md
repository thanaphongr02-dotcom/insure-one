# INSURE ONE — Production launch gates

**Status: NOT APPROVED FOR LIVE SALES.** This checklist is an engineering handoff, not a legal or insurer authorization.

## 1. Current code integration
- [ ] Integrate and test PR #4 (restore actual quote-request form); current storefront branch's `/quote` is a quote-details screen expecting an ID and cannot reliably accept a new request.
- [ ] Integrate and test PR #3 (admin access guard), then verify **server-side / database** authorization; a client-side guard is not a security boundary.
- [ ] Integrate PR #5 storefront only after CI, Vercel, responsive and accessibility review.
- [ ] Confirm all category links, member links, quote links, promotion links, and search filters work in deployed preview.

## 2. Product and promotional integrity
- [ ] Obtain written rights/permission from each insurer or authorized distributor before using names/logos or offering their products.
- [ ] Verify each product's insurer, underwriting entity, availability, terms, exclusions, premium, payment period, effective dates, and source URL.
- [ ] Show promotions only when start/end dates and authoritative supporting terms are present; never manufacture discount percentages, premiums, customer counts, partnerships or 24/7 support.
- [ ] Make stale/unknown premiums request-a-quote only. Do not imply a binding policy quote.

## 3. Security and customer data
- [ ] Audit Supabase RLS on `insurance_plans`, `quote_requests`, `orders`, `payments`, `profiles` and admin tables with anon, customer A, customer B and admin test accounts.
- [ ] Verify no private documents, ID images, policy files, customer contact details or service-role keys are public.
- [ ] Validate every server-side order transition and payment callback; use webhook signatures, idempotency and audit logs.
- [ ] Confirm consent, privacy notice, retention/deletion, support contact and complaint channel are correct for actual operator.
- [ ] Enable rate limits, anti-abuse controls, monitoring, backups and recovery rehearsal.

## 4. Commercial and regulatory launch
- [ ] Identify the actual selling entity and licensed persons, their scope of authority, insurer/distributor contracts and applicable Thai insurance regulatory obligations; have operator/legal compliance approve customer-facing wording.
- [ ] Obtain authorized product feeds/APIs and sandbox credentials, then test quote, underwriting/acceptance, issuance, cancellations and claims handoff with each insurer.
- [ ] Configure a merchant payment account in the authorized operator's name. Do not use a developer's personal payment details or simulate successful payment.
- [ ] Perform end-to-end UAT with **test customers and test transactions**: register → browse → request quote → admin response → insurer-confirmed offer → payment → verified issuance → documents.
- [ ] Only enable live payment and policy-issuance features after written approvals and verified sandbox tests.

## Release decision
Current supported launch mode: **public informational/catalog website + request-for-quote workflow only after PR #4 and RLS checks**. Do not advertise immediate purchase, instant issuance or confirmed partnerships until integrated and authorized.
