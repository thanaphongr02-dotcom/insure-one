-- INSURE ONE: read-only pre-payment security audit
-- Safe to run in Supabase SQL Editor. No data modifications.
-- Run with an administrative SQL editor account; do not expose results publicly.

-- 1. Who can INSERT/UPDATE insurance_orders via API roles?
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'insurance_orders'
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY grantee, privilege_type;

-- 2. Current row-level policies.
SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'insurance_orders'
ORDER BY policyname;

-- 3. Who can execute public functions that may affect payments?
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS arguments,
       r.rolname AS owner, p.prosecdef AS security_definer,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_roles r ON r.oid = p.proowner
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- 4. Order-related triggers and definitions.
SELECT t.tgname, t.tgenabled, pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
WHERE t.tgrelid = 'public.insurance_orders'::regclass
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 5. Check constraints and foreign keys.
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.insurance_orders'::regclass
ORDER BY conname;

-- 6. Check whether authenticated has column-level UPDATE privileges.
SELECT column_name,
       has_column_privilege('authenticated', 'public.insurance_orders',
                            column_name, 'UPDATE') AS authenticated_can_update
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'insurance_orders'
ORDER BY ordinal_position;
