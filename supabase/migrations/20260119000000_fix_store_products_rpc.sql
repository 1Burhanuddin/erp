-- Fix get_store_products RPC to correctly join with categories/brands via website_products view
-- Previously it failed because it tried to access non-existent 'category' column on products table.

CREATE OR REPLACE FUNCTION get_store_products(p_store_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    price DECIMAL,
    original_price DECIMAL,
    images JSONB,
    features JSONB,
    stock_quantity INTEGER,
    category TEXT,
    brand TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wp.id,
        wp.name,
        wp.description,
        -- Use custom price if available, else fall back to website_products price
        COALESCE(sp.custom_price, wp.price) as price,
        wp.original_price,
        wp.images,
        wp.features,
        wp.stock_quantity,
        wp.category, -- This now comes from the View which correctly joins categories
        wp.brand,    -- This also comes from the View
        (wp.is_active AND sp.is_active) as is_active
    FROM website_products wp
    JOIN store_products sp ON wp.id = sp.product_id
    WHERE sp.store_id = p_store_id
      AND wp.is_active = true
      AND sp.is_active = true;
END;
$$ LANGUAGE plpgsql;
