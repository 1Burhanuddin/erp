create table if not exists public.business_profiles (
  id uuid not null default gen_random_uuid (),
  company_name text not null,
  company_type text null,
  address text null,
  phone text null,
  email text null,
  website text null,
  logo_url text null,
  signature_url text null,
  gstin text null,
  pan_no text null,
  tax_scheme text null,
  owner_name text null,
  owner_phone text null,
  owner_email text null,
  bank_name text null,
  account_no text null,
  ifsc_code text null,
  branch_name text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint business_profiles_pkey primary key (id)
);

-- Add RLS policies (optional but recommended)
alter table public.business_profiles enable row level security;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.business_profiles;
DROP POLICY IF EXISTS "Enable insert/update for authenticated users" ON public.business_profiles;

create policy "Enable read access for authenticated users"
on public.business_profiles for select
to authenticated
using (true);

create policy "Enable insert/update for authenticated users"
on public.business_profiles for all
to authenticated
using (true);
