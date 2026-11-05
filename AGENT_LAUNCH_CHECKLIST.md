# INSURE ONE — Individual non-life insurance agent launch checklist

Owner-reported status: individual holding a non-life insurance agent license. This does not establish any particular insurer appointment or right to sell a specific product.

## Mandatory verification before real sales
- [ ] Verify the agent license and its validity against OIC registry.
- [ ] Confirm the insurer(s) named on the license and the contractual right to market each product online.
- [ ] If adding another insurer, obtain all legally required consent/appointments before displaying products.
- [ ] Obtain insurer-approved marketing wording, rates, terms, disclosures, and document handling rules.
- [ ] Confirm whether the insurer authorizes the agent to collect premiums, the collection/receipt workflow, and whether a personal merchant account is acceptable.
- [ ] Confirm the insurer's payment links, policy issuance verification and receipt format.
- [ ] Obtain payment provider approval for this regulated business and permitted payment methods.
- [ ] Implement verified server-side payment webhook and database privilege hardening; test on staging before production.
- [ ] Verify private policy storage access with two distinct customer accounts.
- [ ] Publish a privacy notice and operational contact information.
- [ ] Obtain insurer sign-off on any automated issuance workflow.

## Safe interim launch
- Member registration, requests for quotes, admin follow-up, insurer-approved offers.
- Customer acceptance of an offer, with clear disclaimer that no coverage has begun.
- No payment collection or automatic policy issuance.

## Regulatory references for independent review
- https://oiceservice.oic.or.th/
- https://law.longdo.com/law/364

**Never commit personal ID scans, license images, banking credentials or payment API secrets to GitHub.**
