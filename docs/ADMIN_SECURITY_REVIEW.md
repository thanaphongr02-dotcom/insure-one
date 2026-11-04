# Admin authorization and customer data review

## What this change does
The shared `/admin` layout waits for a fresh Supabase authenticated-user lookup and `admin_users` membership before rendering any nested admin page. It also reacts to sign-out/account changes. This is a **client-side presentation gate**, not a server-side security boundary. Existing nested page checks remain in place.

## P0: Required before handling real customer information
1. Verify RLS is enabled on `admin_users`, `quote_requests`, `quote_status_history`, `insurance_offers`, `insurance_orders`, `insurance_plans` and `insurance_companies` as appropriate.
2. Confirm a normal signed-in user cannot select another user's quote, history, offer, order or private PDF through direct Supabase REST/storage calls, even if the UI hides the record.
3. Confirm non-admin users cannot insert/update/delete admin-managed data by direct API calls. The `admin_users` table must not permit self-granting admin rights.
4. Confirm `insurance-policies` is private, signed URLs have short expiry, and authorization is tied to the owning customer or verified admin. Avoid broad public storage access.
5. Verify payment and policy status transitions are enforced in DB/server-side logic. A browser confirmation dialog is **not** proof of payment or insurer issuance.
6. Review the privacy notice and implement a real data subject request contact and handling workflow.

## Suggested staging-only negative tests
- User A creates a synthetic quote. User B requests A's quote ID and history ID via the Supabase API: must return no records / forbidden.
- User B attempts `UPDATE quote_requests SET status='completed'` on A's synthetic quote: must fail.
- User B requests `admin_users` or attempts to insert their own user ID: must not elevate privilege.
- User B attempts to update a synthetic order's `payment_confirmed_at`, `policy_number` or `status`: must fail.
- User B tries to download another customer's private policy document: must fail.
- An actual admin can access permitted synthetic records and cannot bypass DB transition guards.

Run tests against isolated staging accounts/data only. Do not test by modifying live orders or genuine insurer policy numbers.

## Deployment
This PR adds no migrations, does not change the payment workflow and does not alter existing customer data. CI build passing does not prove RLS is correctly configured.
