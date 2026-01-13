-- Create tax_rates table
CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tax_rates;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON tax_rates;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON tax_rates;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON tax_rates;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON tax_rates
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON tax_rates
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON tax_rates
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON tax_rates
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert default GST rates
INSERT INTO tax_rates (name, percentage, description) VALUES
    ('GST 0%', 0, 'Nil Rated'),
    ('GST 5%', 5, '5% GST Slab'),
    ('GST 12%', 12, '12% GST Slab'),
    ('GST 18%', 18, '18% GST Slab'),
    ('GST 28%', 28, '28% GST Slab');
