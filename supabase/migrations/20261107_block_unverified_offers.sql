-- Apply after 20261105_insurer_partnerships.sql and hardening migration.
-- Fail-closed: no newly sent offers without an approved insurer appointment.
-- Drafts are allowed for internal review. This does not validate premiums.
create or replace function public.guard_unverified_insurer_offer()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'sent' and (tg_op = 'INSERT' or old.status is distinct from 'sent') then
    if not exists (
      select 1 from public.insurer_partnerships p
      where (p.verified_legal_name = new.company_name or
             (p.verified_legal_name is null and p.supplied_name = new.company_name))
        and p.contract_status = 'signed'
        and p.regulatory_status = 'verified_active'
        and p.appointment_verified = true
        and p.insurer_permission_for_catalog = true
    ) then
      raise exception 'Insurer offer cannot be sent without verified appointment and permissions'
        using errcode = '42501';
    end if;
    -- Deliberately requires further insurer price/quote validation before production.
    raise exception 'Sending insurer offers is disabled until a trusted price-verification workflow is deployed'
      using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_unverified_insurer_offer() from public;
drop trigger if exists guard_unverified_insurer_offer on public.insurance_offers;
create trigger guard_unverified_insurer_offer
before insert or update of status on public.insurance_offers
for each row execute function public.guard_unverified_insurer_offer();
