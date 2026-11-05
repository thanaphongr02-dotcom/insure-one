-- Run AFTER 20261105_insurer_partnerships.sql.
-- Prevent a browser/admin session from self-approving insurer contracts,
-- appointments, regulatory status, API access or commission rights.
-- Verified fields must be changed by a separate trusted back-office
-- workflow with documentary review and service-side credentials.
revoke all on table public.insurer_partnerships from anon, authenticated;
grant select on table public.insurer_partnerships to authenticated;
grant update (contract_status, notes, updated_at) on table public.insurer_partnerships to authenticated;
-- Prospect rows are seeded by migration; browser clients cannot add arbitrary firms.
create or replace function public.guard_insurer_partnership_browser_updates()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated','anon') then
    if new.id is distinct from old.id
       or new.supplied_name is distinct from old.supplied_name
       or new.verified_legal_name is distinct from old.verified_legal_name
       or new.regulatory_status is distinct from old.regulatory_status
       or new.appointment_verified is distinct from old.appointment_verified
       or new.allowed_nonlife_lines is distinct from old.allowed_nonlife_lines
       or new.insurer_permission_for_catalog is distinct from old.insurer_permission_for_catalog
       or new.api_access_approved is distinct from old.api_access_approved
       or new.commission_agreement_verified is distinct from old.commission_agreement_verified
       or new.created_at is distinct from old.created_at
       or new.contract_status = 'signed'
       or old.contract_status = 'signed' then
      raise exception 'Partnership approvals require verified back-office workflow'
        using errcode = '42501';
    end if;
  end if;
  new.updated_at = now();
  return new;
end $$;
revoke all on function public.guard_insurer_partnership_browser_updates() from public;
drop trigger if exists guard_insurer_partnership_browser_updates on public.insurer_partnerships;
create trigger guard_insurer_partnership_browser_updates
before update on public.insurer_partnerships
for each row execute function public.guard_insurer_partnership_browser_updates();

-- Ensure only authenticated administrators can see and update rows.
-- Existing RLS policies in the preceding migration remain in force.
create index if not exists insurer_partnerships_contract_status_idx
  on public.insurer_partnerships (contract_status);
