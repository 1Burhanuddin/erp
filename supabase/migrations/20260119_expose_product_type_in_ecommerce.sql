-- Drop view (cascade drops RPC that depends on it)
DROP VIEW IF EXISTS website_products CASCADE;
-- Explicitly drop the function as well to be safe, though CASCADE above might catch it if it depends on the view. 
-- However, the error usually implies the function exists independently or the dependency wasn't strong enough to cascade delete it in a way that allows recreation with diff signature without explicit drop.
DROP FUNCTION IF EXISTS get_store_products(UUID);

-- Recreate View with 'product_type'
CREATE OR REPLACE VIEW website_products AS
SELECT 
    p.id,
    p.name,
    p.description,
    COALESCE(p.online_price, p.sale_price) as price,
    p.sale_price as original_price,
    p.features,
    p.images,
    p.is_online as is_active,
    p.current_stock as stock_quantity,
    p.condition,
    p.type as product_type, -- Expose the Type (Product/Service)
    p.created_at,
    p.updated_at,
    b.name as brand,
    c.name as category_raw,
    CASE 
        WHEN c.name ILIKE '%Old%' OR p.condition ILIKE '%Used%' THEN 'old_ac'
        ELSE 'new_ac'
    END as category,
    u.name as capacity
FROM products p
LEFT JOIN product_brands b ON p.brand_id = b.id
LEFT JOIN product_categories c ON p.category_id = c.id
LEFT JOIN product_units u ON p.unit_id = u.id;

-- Recreate RPC with 'product_type'
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
    product_type TEXT, -- New Column
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wp.id,
        wp.name,
        wp.description,
        COALESCE(sp.custom_price, wp.price) as price,
        wp.original_price,
        wp.images,
        wp.features,
        wp.stock_quantity,
        wp.category,
        wp.brand,
        wp.product_type, -- Select the new column
        (wp.is_active AND sp.is_active) as is_active
    FROM website_products wp
    JOIN store_products sp ON wp.id = sp.product_id
    WHERE sp.store_id = p_store_id
      AND wp.is_active = true
      AND sp.is_active = true;
END;
$$ LANGUAGE plpgsql;
