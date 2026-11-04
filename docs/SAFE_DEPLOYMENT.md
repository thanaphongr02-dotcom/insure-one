# INSURE ONE safe deployment checklist

This PR adds informational pages and a registration acknowledgement. It does **not** certify PDPA compliance or enable payment collection.

- [ ] Replace draft privacy and terms pages with legally reviewed notices including controller identity, lawful bases, recipients, retention, overseas transfers and contact channel.
- [ ] Validate whether registration is permitted before the final notice is published; if not, disable production sign-up until reviewed.
- [ ] Confirm separate lawful basis and specific consent for any marketing or sensitive health data.
- [ ] Verify Supabase RLS, storage policies and authorization with two distinct test users plus an admin.
- [ ] Review all Supabase SQL migrations separately. Do not run unreviewed migrations against live data.
- [ ] Verify insurer and payment provider permissions and real settlement checks before marking any order paid.
- [ ] Check build, lint, UI navigation, accessibility and responsive layout in staging.
- [ ] Keep the existing real policy number and order status untouched.

No production schema, order, payment or policy data is modified by this PR.
