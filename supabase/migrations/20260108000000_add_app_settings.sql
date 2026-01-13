-- Add timezone and currency columns to business_profiles
alter table public.business_profiles
add column if not exists timezone text default 'UTC',
add column if not exists currency text default 'INR';

-- Add comment for documentation
comment on column public.business_profiles.timezone is 'Timezone for the business (e.g., Asia/Kolkata, America/New_York)';
comment on column public.business_profiles.currency is 'Currency code (e.g., INR, USD, EUR)';
