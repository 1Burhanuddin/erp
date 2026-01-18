-- Migration to Isolate Settings (Business Profiles & Tax Rates) per User
-- Similar to how we did for products, bookings, and stores.

-- 1. Add owner_id to business_profiles
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Force RLS to check owner_id for business_profiles
-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON business_profiles;
DROP POLICY IF EXISTS "Enable insert/update for authenticated users" ON business_profiles;
DROP POLICY IF EXISTS "Users can manage their own business profile" ON business_profiles; -- in case of re-run

-- Create new strict policies
CREATE POLICY "Users can manage their own business profile" ON business_profiles
    FOR ALL
    USING (owner_id = auth.uid());

-- 2. Add owner_id to tax_rates
ALTER TABLE tax_rates 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Force RLS to check owner_id for tax_rates
-- Drop existing
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tax_rates;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON tax_rates;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON tax_rates;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON tax_rates;

-- Create new strict policies
CREATE POLICY "Users can manage their own tax rates" ON tax_rates
    FOR ALL
    USING (owner_id = auth.uid());

-- 3. Cleanup Default Data (Optional but recommended)
-- The default GST rates inserted in previous migration have NULL owner_id (or default admin's if run by an admin).
-- If we want NEW users to see default tax rates, we might need a trigger or a public "template" table.
-- For now, let's allow them to see "System" rates (where owner_id is NULL) as READ ONLY,
-- OR just let them create their own.
-- User asked for "all things are blank for new account", implies they might WANT blank tax rates or their own.
-- However, typically GST rates are standard.
-- Let's make a compromise: Allow reading NULL owner_id (System Defaults) but only editing own.

CREATE POLICY "Users can read system tax rates" ON tax_rates
    FOR SELECT
    USING (owner_id IS NULL);

-- Wait, the previous policy "Users can manage their own tax rates" handles ALL.
-- If we want to allow reading system rates, we need a separate SELECT policy or OR condition.
-- Let's refine the tax_rates policy:

DROP POLICY IF EXISTS "Users can manage their own tax rates" ON tax_rates;

CREATE POLICY "Users can read own and system tax rates" ON tax_rates
    FOR SELECT
    USING (owner_id = auth.uid() OR owner_id IS NULL);

CREATE POLICY "Users can insert own tax rates" ON tax_rates
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own tax rates" ON tax_rates
    FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own tax rates" ON tax_rates
    FOR DELETE
    USING (owner_id = auth.uid());
