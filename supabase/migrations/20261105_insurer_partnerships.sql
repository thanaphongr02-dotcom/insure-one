-- INSURE ONE: prospect tracking, separate from public insurer catalog.
-- Review in Supabase SQL Editor; NOT applied automatically.
create table if not exists public.insurer_partnerships (
  id text primary key check (id ~ '^prospect-[0-9]{2}$'),
  supplied_name text not null,
  verified_legal_name text,
  regulatory_status text not null default 'unverified'
    check (regulatory_status in ('unverified','verified_active','requires_review','inactive')),
  contract_status text not null default 'contacting'
    check (contract_status in ('contacting','negotiating','pending_signature','signed','rejected')),
  appointment_verified boolean not null default false,
  allowed_nonlife_lines text[] not null default '{}',
  insurer_permission_for_catalog boolean not null default false,
  api_access_approved boolean not null default false,
  commission_agreement_verified boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_appointment_without_signed_contract
    check (not appointment_verified or contract_status = 'signed'),
  constraint no_api_without_appointment
    check (not api_access_approved or appointment_verified)
);
alter table public.insurer_partnerships enable row level security;
revoke all on public.insurer_partnerships from anon;
grant select, insert, update on public.insurer_partnerships to authenticated;
drop policy if exists insurer_partnerships_admin_select on public.insurer_partnerships;
create policy insurer_partnerships_admin_select on public.insurer_partnerships
for select to authenticated using (
  exists(select 1 from public.admin_users a where a.user_id = (select auth.uid()))
);
drop policy if exists insurer_partnerships_admin_insert on public.insurer_partnerships;
create policy insurer_partnerships_admin_insert on public.insurer_partnerships
for insert to authenticated with check (
  exists(select 1 from public.admin_users a where a.user_id = (select auth.uid()))
);
drop policy if exists insurer_partnerships_admin_update on public.insurer_partnerships;
create policy insurer_partnerships_admin_update on public.insurer_partnerships
for update to authenticated
using (exists(select 1 from public.admin_users a where a.user_id = (select auth.uid())))
with check (exists(select 1 from public.admin_users a where a.user_id = (select auth.uid())));
-- Only creates missing rows; reruns never overwrite administrator updates.
insert into public.insurer_partnerships (id, supplied_name) values
  ('prospect-01', 'ไทยเศรษฐกิจประกันภัย'),
  ('prospect-02', 'แรบบิท ประกันภัย'),
  ('prospect-03', 'เจมาร์ท ประกันภัย'),
  ('prospect-04', 'สยามสไมล์ ประกันภัย'),
  ('prospect-05', 'บางกอกสหประกันภัย'),
  ('prospect-06', 'ไทยไพบูลย์ประกันภัย'),
  ('prospect-07', 'เคดับบลิวไอ ประกันภัย'),
  ('prospect-08', 'เทเวศประกันภัย'),
  ('prospect-09', 'ไอโออิ กรุงเทพ ประกันภัย'),
  ('prospect-10', 'ฟอลคอนประกันภัย'),
  ('prospect-11', 'ไทยศรีประกันภัย'),
  ('prospect-12', 'เออร์โกประกันภัย'),
  ('prospect-13', 'เอ็มเอสไอจี ประกันภัย'),
  ('prospect-14', 'ซมโปะ ประกันภัย'),
  ('prospect-15', 'แอลเอ็มจี ประกันภัย'),
  ('prospect-16', 'นวกิจประกันภัย'),
  ('prospect-17', 'ไทยวิวัฒน์ประกันภัย'),
  ('prospect-18', 'แอกซ่าประกันภัย'),
  ('prospect-19', 'อลิอันซ์ อยุธยา ประกันภัย'),
  ('prospect-20', 'เอไอจี ประกันภัย'),
  ('prospect-21', 'ชับบ์สามัคคีประกันภัย'),
  ('prospect-22', 'คุ้มภัยโตเกียวมารีนประกันภัย'),
  ('prospect-23', 'ธนชาตประกันภัย'),
  ('prospect-24', 'สินมั่นคงประกันภัย'),
  ('prospect-25', 'เมืองไทยประกันภัย'),
  ('prospect-26', 'กรุงเทพประกันภัย')
on conflict (id) do nothing;
