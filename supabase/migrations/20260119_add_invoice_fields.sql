-- Add HSN Code to products
ALTER TABLE products ADD COLUMN hsn_code text;

-- Add State to contacts and business_profiles
ALTER TABLE contacts ADD COLUMN state text;
ALTER TABLE business_profiles ADD COLUMN state text;

-- Add Tax Inclusive flag to products
ALTER TABLE products ADD COLUMN is_tax_inclusive boolean DEFAULT false;
