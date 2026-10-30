-- INSURE ONE starter schema. Review with a qualified developer before production.
-- Run only in a new test Supabase project first.

create table if not exists public.insurance_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  official_website text,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.insurance_products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.insurance_companies(id),
  product_name text not null,
  category text not null,
  summary text,
  premium_amount numeric(12,2),
  premium_currency text not null default 'THB',
  coverage_details text,
  exclusions_summary text,
  online_purchase_status text not null default 'not_verified'
    check (online_purchase_status in ('not_verified','quote_only','online_purchase_approved','inactive')),
  source_url text,
  verified_at timestamptz,
  price_valid_until date,
  approved_for_publication boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  contact_name text not null,
  contact_method text not null,
  category text not null,
  product_id uuid references public.insurance_products(id) on delete set null,
  customer_message text,
  status text not null default 'new'
    check (status in ('new','contacting','quoted','closed')),
  privacy_notice_version text,
  consent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid references public.insurance_products(id) on delete set null,
  order_status text not null default 'pending_review'
    check (order_status in ('pending_review','awaiting_payment','paid','submitted_to_insurer','policy_confirmed','cancelled','refunded')),
  premium_amount numeric(12,2),
  premium_currency text not null default 'THB',
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_reference text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','processing','paid','failed','cancelled','refunded')),
  amount numeric(12,2) not null,
  currency text not null default 'THB',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  insurer_policy_reference text,
  policy_status text not null default 'pending_confirmation'
    check (policy_status in ('pending_confirmation','active','expired','cancelled')),
  effective_date date,
  expiry_date date,
  created_at timestamptz not null default now()
);

-- Enable RLS on customer-facing tables. Policies below are a starting point, not a full production security review.
alter table public.insurance_companies enable row level security;
alter table public.insurance_products enable row level security;
alter table public.quote_requests enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.policies enable row level security;

-- Public can read only products explicitly approved for publication and online purchase status.
create policy "Public can view approved products"
on public.insurance_products for select
using (approved_for_publication = true and online_purchase_status <> 'inactive');

-- Do not add public insert/read policies for orders, payments, or policies.
-- Quote form should be implemented through a server endpoint with validation, rate limiting,
-- privacy notice/consent handling, and controlled access.
-- Admin operations must use server-side authorization and never expose service-role keys to browsers.
