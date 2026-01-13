-- Add tax columns to purchase_items
ALTER TABLE purchase_items
ADD COLUMN IF NOT EXISTS tax_rate_id UUID REFERENCES tax_rates(id),
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0;

-- Add tax columns to sales_items
ALTER TABLE sales_items
ADD COLUMN IF NOT EXISTS tax_rate_id UUID REFERENCES tax_rates(id),
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0;
