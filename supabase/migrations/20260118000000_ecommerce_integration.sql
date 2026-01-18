-- Add Ecommerce columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS online_price NUMERIC,
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'New';

-- Create Packages table (for Website compatibility)
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0
);

-- Create Bookings table (for Website Service Requests)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    service_type TEXT NOT NULL, -- 'new_ac', 'old_ac', 'repair', etc.
    package_id UUID REFERENCES packages(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    preferred_date DATE,
    preferred_time TEXT,
    address TEXT,
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) -- Optional link to auth user if they log in
);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Website (Public/Anon access)

-- Packages: Read-only for public
CREATE POLICY "Public can view active packages" ON packages
    FOR SELECT
    USING (is_active = true);

-- Bookings: Insert for public (Guest checkout/booking)
CREATE POLICY "Public can create bookings" ON bookings
    FOR INSERT
    WITH CHECK (true);

-- Bookings: Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT
    USING (auth.uid() = user_id);

-- ERP Admin policies (Full access)
-- Assuming 'authenticated' users in ERP are admins/staff for now. 
-- You might want to refine this with proper role checks if you have strict RBAC.
CREATE POLICY "Staff can manage packages" ON packages
    FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage bookings" ON bookings
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Create Compatibility View for Products
-- This maps the ERP normalized schema to the Client's flat schema
CREATE OR REPLACE VIEW website_products AS
SELECT 
    p.id,
    p.name,
    p.description,
    COALESCE(p.online_price, p.sale_price) as price,
    p.sale_price as original_price, -- Mapping MRP/Original price
    p.features,
    p.images,
    p.is_online as is_active,
    p.current_stock as stock_quantity,
    p.condition,
    p.created_at,
    p.updated_at,
    -- Map Foreign Keys to Strings for simpler frontend consumption
    b.name as brand,
    c.name as category_raw, -- Need to handle mapping to 'new_ac'/'old_ac' enum if strict
    CASE 
        WHEN c.name ILIKE '%Old%' OR p.condition ILIKE '%Used%' THEN 'old_ac'
        ELSE 'new_ac'
    END as category,
    u.name as capacity -- Mapped from Unit? Or add specific capacity column? Using Unit for now or brand model details.
    -- Note: 'capacity' and 'energy_rating' might need specific columns in ERP if not present.
FROM products p
LEFT JOIN product_brands b ON p.brand_id = b.id
LEFT JOIN product_categories c ON p.category_id = c.id
LEFT JOIN product_units u ON p.unit_id = u.id
WHERE p.is_online = true;

-- Grant access to the view
GRANT SELECT ON website_products TO anon;
GRANT SELECT ON website_products TO authenticated;
GRANT SELECT ON website_products TO service_role;
