-- Add 'type' column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Product' CHECK (type IN ('Product', 'Service'));

-- Note: We do not enforce NOT NULL on brand_id and unit_id in the original schema (implicit nullable), 
-- so Service products can just leave them NULL.
-- But if strict constraints were added later, we might need to alter them. 
-- For now, we assume they are nullable.
