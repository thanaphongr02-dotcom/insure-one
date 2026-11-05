# INSURE ONE — Supabase deployment record (2026-11-05)

Project: `ihrsffydglccuuzmqbbo` (`insure-one`). Do not run these operations against the unrelated project.

## Applied remotely
- Created `public.insurer_partnerships`, enabled RLS, granted admin-only SELECT/limited UPDATE and denied browser INSERT.
- Added verified-company fields, appointment/API constraints and browser update guard trigger.
- Added `guard_unverified_insurer_offer` trigger on every INSERT/UPDATE of `insurance_offers`; status `sent` is always blocked until verified insurer pricing workflow exists.
- Revoked direct EXECUTE on `log_quote_status_change()` for PUBLIC, anon, authenticated.
- Seeded 26 prospect companies, none with verified appointment.

These changes were applied using **separate, smaller remote migrations**, not by executing the three checked-in SQL files verbatim. Do not blindly reapply the checked-in files; reconcile migration history and current schema first.

## Verified with SQL
- `insurer_partnerships` rows: 26; `appointment_verified = true`: 0.
- `anon` has no SELECT on `insurer_partnerships`.
- `authenticated` has SELECT and column UPDATE on notes but not INSERT or UPDATE of `appointment_verified`.
- Direct EXECUTE on trigger functions and `log_quote_status_change()` is denied to anon/authenticated.

## Remaining before production
1. Test RLS with actual authenticated member/admin sessions, and test form submission and admin CRM end to end.
2. Validate existing `respond_to_insurance_offer(uuid,text)` SECURITY DEFINER function ownership checks and access semantics. It remains callable by authenticated users.
3. Enable leaked-password protection in Supabase Auth settings, if supported by the project plan.
4. Run negative tests for status `sent`, partner approval attempts and unauthorized access; confirm draft workflows.
5. Reconcile remote migration history with repository migrations and create a clean baseline for subsequent deployments.
6. Merge feature branch only after verification; do not enable insurer sales, live quotes, checkout or commission without contracts and approved insurer integrations.

## Security advisory references
- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
