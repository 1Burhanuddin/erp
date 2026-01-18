-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT, -- e.g., 'https://my-ac-store.com'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users (ERP admins) can do everything
CREATE POLICY "Admins can manage stores" ON stores
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Policy: Public read access might be needed if we want to validate keys publically, 
-- but for now let's keep it restricted or assume the client uses a Service Key or similar.
-- Actually, for the client website to "know" its details, publicly readable might be easier 
-- if we filter by ID.
CREATE POLICY "Public read access to stores" ON stores
    FOR SELECT
    USING (true);


-- Create booking source / store link
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);


-- Create store_products junction table
-- This controls WHICH products are available on WHICH store
CREATE TABLE IF NOT EXISTS store_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true, -- Can hide a product from a specific store
    custom_price DECIMAL(10,2), -- Override the base price for this store
    custom_stock INTEGER, -- Optional separate stock pool (advanced) or just override
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, product_id)
);

-- Enable RLS
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage store products" ON store_products
    FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Public read store products" ON store_products
    FOR SELECT
    USING (true);


-- RPC Function to get products for a specific store
-- This replaces the simple 'website_products' view for multi-store setups
CREATE OR REPLACE FUNCTION get_store_products(p_store_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    price DECIMAL,
    original_price DECIMAL,
    images JSON,
    features JSON,
    stock_quantity INTEGER,
    category TEXT,
    brand TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        -- Use custom price if available, else fall back to online_price, else sale_price
        COALESCE(sp.custom_price, p.online_price, p.sale_price) as price,
        p.sale_price as original_price,
        p.images,
        p.features,
        p.current_stock,
        p.category, -- Use the text column directly
        p.brand,    -- Use the text column directly
        -- Product is active if it exists in the link AND is marked active there
        (p.is_online AND sp.is_active) as is_active
    FROM products p
    JOIN store_products sp ON p.id = sp.product_id
    WHERE sp.store_id = p_store_id
      AND p.is_online = true
      AND sp.is_active = true;
END;
$$ LANGUAGE plpgsql;
