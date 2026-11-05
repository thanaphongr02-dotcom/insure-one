# INSURE ONE — insurer onboarding and commission operations

## What is possible now
- Public site, customer registration, quote request and manual follow-up.
- Catalog entries only from documented, approved insurer material.
- Commission projections for internal use only, clearly distinguished from insurer statements.

## Insurer data acquisition: permitted routes
1. Request an authorized agent/partner portal account and written permission to use product details and logos.
2. Request a partner API agreement, sandbox endpoint, product/rate schema, authentication method, rate limits, webhook spec, IP allowlist requirements and production sign-off.
3. If no API is provided, manually maintain insurer-approved product materials with source URL/document reference, revision and expiry.
4. Never scrape protected portals, bypass authentication, reuse someone else's credentials, or imply insurer endorsement without authorization.

## Commercial checklist
- Verify license and insurer appointment for every insurer and insurance line.
- Agree on commission percentage or amount **in writing**, payout eligibility, clawbacks, renewals, cancellations and taxes.
- Agree who collects premium and who issues policy and official receipt.
- Record customer consent, audit trail, complaint process, PDPA notice and retention rules.
- Obtain compliance approval for ads and marketing wording.
- Separate life insurance distribution from non-life license scope.

## Commission calculation (illustration, NOT a promised rate)
Gross commission = eligible premium base × contracted commission rate.
Net cash received = actual insurer remittance − reversals − costs − applicable withholding/tax.
Never count a lead, an accepted quote or an unverified payment as earned commission.

## Deployment gates
- Build and typecheck pass; environment variables present.
- RLS tests with two different member accounts and admin.
- Database permissions prevent manual payment and policy status forgery.
- Insurer API contract and sandbox test verified.
- Payment gateway approved and signed webhook tested for replay/idempotency.
- Official insurer issuance verification and private policy PDF access tested.
- Customer service contact, disclosure, privacy and terms reviewed.
- Final production deployment and smoke tests documented.

## Potential partner discussions (not integrations or endorsements)
- Chubb Samaggi Producer Hub: https://chubb-b70a-prod.adobecqms.net/th-th/partners/idp-with-chubbsamaggi.html
- AIG myAIG: https://www.aig.co.th/home/risk-solutions/agency/myaig-for-partners
- Bangkok Insurance partner API: https://www.bangkokinsurance.com/en/investor/news/952
- CheckDi partner API / white-label: https://checkdi.com/pg/partners/main?lg=th

No API keys or insurer data feeds are currently connected by this document.
