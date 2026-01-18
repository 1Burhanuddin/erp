-- Migration to COMPLETELY Lock Down Multi-Tenancy
-- Addresses: Stores, Products (listing), Categories, Sub-Categories, Brands, Units, 
--            Purchase Orders, Sales Orders, Returns, Expenses, Contacts, Deals
-- This migration ensures STRICT data isolation per user account

-- 1. Helper function to quick-add owner_id and policy
CREATE OR REPLACE PROCEDURE secure_table(table_name text)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Add owner_id column if not exists
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()', table_name);
    
    -- Drop ALL existing permissive policies (Clean slate)
    EXECUTE format('DROP POLICY IF EXISTS "Enable all access for authenticated users" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Enable all access for anon" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read access" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public insert access" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public update access" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public delete access" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Admins can manage stores" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can only manage their own stores" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Public read access to stores" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Public read products via RPC or Direct" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can manage their own products" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can manage their own bookings" ON %I', table_name);
    
    -- Policies from 20250103000000_secure_rls.sql (using user_id - will be replaced by owner_id)
    EXECUTE format('DROP POLICY IF EXISTS "Users can view own data" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can insert own data" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can update own data" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can delete own data" ON %I', table_name);
    
    -- Drop own policy if exists (to update definition)
    EXECUTE format('DROP POLICY IF EXISTS "Owner Access Only" ON %I', table_name);

    -- Create Strict Owner Policy for Authenticated Users
    -- Note: Data with NULL owner_id will be hidden from this policy
    EXECUTE format('CREATE POLICY "Owner Access Only" ON %I FOR ALL TO authenticated USING (owner_id = auth.uid())', table_name);
END;
$$;

-- 2. Apply to ALL tables (Procedure creates column & strict policy)
CALL secure_table('products');
CALL secure_table('product_categories');
CALL secure_table('product_sub_categories');
CALL secure_table('product_brands');
CALL secure_table('product_units');
CALL secure_table('stores'); 
CALL secure_table('contacts');
CALL secure_table('deals');
CALL secure_table('expenses');
CALL secure_table('expense_categories');
CALL secure_table('purchase_orders');
CALL secure_table('sales_orders');
CALL secure_table('purchase_returns');
CALL secure_table('sales_returns');
CALL secure_table('stock_adjustments');
CALL secure_table('bookings');

-- Child tables
CALL secure_table('sales_items');
CALL secure_table('purchase_items');
CALL secure_table('purchase_return_items');
CALL secure_table('sales_return_items');
CALL secure_table('stock_adjustment_items');
CALL secure_table('sales_payments');

-- Store Products Junction
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
DROP POLICY IF EXISTS "Admins can manage store products" ON store_products;
DROP POLICY IF EXISTS "Public read store products" ON store_products;
DROP POLICY IF EXISTS "Owner Access Only" ON store_products;
DROP POLICY IF EXISTS "Anon Read Store Products" ON store_products;
CREATE POLICY "Owner Access Only" ON store_products FOR ALL TO authenticated USING (owner_id = auth.uid());

-- 3. Data Rescue: Migrate user_id -> owner_id and Infer from Parents
-- This section runs AFTER columns are added but effectively "patches" the data
DO $$
BEGIN
    -- A. Migrate direct user_id where exists
    
    -- Products
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'user_id') THEN
        UPDATE products SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    
    -- Categories
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_categories' AND column_name = 'user_id') THEN
        UPDATE product_categories SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    
    -- Brands
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_brands' AND column_name = 'user_id') THEN
        UPDATE product_brands SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    
    -- Units
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_units' AND column_name = 'user_id') THEN
        UPDATE product_units SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    
    -- Expenses & Categories
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'user_id') THEN
        UPDATE expenses SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense_categories' AND column_name = 'user_id') THEN
        UPDATE expense_categories SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    
    -- Orders & Contacts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'user_id') THEN
        UPDATE purchase_orders SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_orders' AND column_name = 'user_id') THEN
        UPDATE sales_orders SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'user_id') THEN
        UPDATE contacts SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'user_id') THEN
        UPDATE deals SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    
    -- Bookings
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'user_id') THEN
        UPDATE bookings SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    
    -- Returns & Adjustments (if user_id exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_returns' AND column_name = 'user_id') THEN
        UPDATE sales_returns SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_adjustments' AND column_name = 'user_id') THEN
        UPDATE stock_adjustments SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;

    -- Sales Payments
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_payments' AND column_name = 'user_id') THEN
        UPDATE sales_payments SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;
    END IF;
    
    -- B. Infer owner_id for child tables / tables without user_id
    
    -- Sub Categories -> Categories
    UPDATE product_sub_categories s
    SET owner_id = c.owner_id
    FROM product_categories c
    WHERE s.category_id = c.id
    AND s.owner_id IS NULL
    AND c.owner_id IS NOT NULL;
    
    -- Purchase Returns -> Purchase Orders
    UPDATE purchase_returns pr
    SET owner_id = po.owner_id
    FROM purchase_orders po
    WHERE pr.purchase_id = po.id
    AND pr.owner_id IS NULL
    AND po.owner_id IS NOT NULL;
    
    -- Purchase Returns Items
    UPDATE purchase_return_items pri
    SET owner_id = pr.owner_id
    FROM purchase_returns pr
    WHERE pri.return_id = pr.id
    AND pri.owner_id IS NULL
    AND pr.owner_id IS NOT NULL;
    
    -- Purchase Items
    UPDATE purchase_items pi
    SET owner_id = po.owner_id
    FROM purchase_orders po
    WHERE pi.purchase_id = po.id
    AND pi.owner_id IS NULL
    AND po.owner_id IS NOT NULL;
    
    -- Sales Items
    UPDATE sales_items si
    SET owner_id = so.owner_id
    FROM sales_orders so
    WHERE si.sale_id = so.id
    AND si.owner_id IS NULL
    AND so.owner_id IS NOT NULL;
    
    -- Sales Return Items
    UPDATE sales_return_items sri
    SET owner_id = sr.owner_id
    FROM sales_returns sr
    WHERE sri.return_id = sr.id
    AND sri.owner_id IS NULL
    AND sr.owner_id IS NOT NULL;
    
    -- Stock Adjustment Items
    UPDATE stock_adjustment_items sai
    SET owner_id = sa.owner_id
    FROM stock_adjustments sa
    WHERE sai.adjustment_id = sa.id
    AND sai.owner_id IS NULL
    AND sa.owner_id IS NOT NULL;
    
    -- Sales Payments (Inference if user_id fail)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_payments' AND column_name = 'sale_id') THEN
        UPDATE sales_payments sp
        SET owner_id = so.owner_id
        FROM sales_orders so
        WHERE sp.sale_id = so.id
        AND sp.owner_id IS NULL
        AND so.owner_id IS NOT NULL;
    END IF;
    
    -- 3.b.1 Stores (Infer from Products via Link - RECOVERY)
    -- If store has products, and products have owner, store belongs to that owner
    UPDATE stores s
    SET owner_id = (SELECT p.owner_id 
                    FROM store_products sp 
                    JOIN products p ON sp.product_id = p.id 
                    WHERE sp.store_id = s.id 
                    AND p.owner_id IS NOT NULL 
                    LIMIT 1)
    WHERE owner_id IS NULL;

    -- 3.b.2 Store Products (Infer from Stores)
    UPDATE store_products sp
    SET owner_id = s.owner_id
    FROM stores s
    WHERE sp.store_id = s.id
    AND sp.owner_id IS NULL
    AND s.owner_id IS NOT NULL;

END $$;

-- 4. Handle Anonymous Access (Website)
DROP POLICY IF EXISTS "Anon Read Stores" ON stores;
DROP POLICY IF EXISTS "Anon Read Products" ON products;
DROP POLICY IF EXISTS "Anon Read Store Products" ON store_products;
DROP POLICY IF EXISTS "Anon Read Categories" ON product_categories;
DROP POLICY IF EXISTS "Anon Read Sub Categories" ON product_sub_categories;
DROP POLICY IF EXISTS "Anon Read Brands" ON product_brands;
DROP POLICY IF EXISTS "Anon Read Units" ON product_units;

CREATE POLICY "Anon Read Stores" ON stores FOR SELECT TO anon USING (true);
CREATE POLICY "Anon Read Products" ON products FOR SELECT TO anon USING (is_online = true);
CREATE POLICY "Anon Read Store Products" ON store_products FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Anon Read Categories" ON product_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Anon Read Sub Categories" ON product_sub_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Anon Read Brands" ON product_brands FOR SELECT TO anon USING (true);
CREATE POLICY "Anon Read Units" ON product_units FOR SELECT TO anon USING (true);

-- Bookings Insert for Anon
DROP POLICY IF EXISTS "Anon Insert Bookings" ON bookings;
CREATE POLICY "Anon Insert Bookings" ON bookings FOR INSERT TO anon WITH CHECK (true);

-- Trigger to set booking owner_id from store
CREATE OR REPLACE FUNCTION set_booking_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.owner_id IS NULL AND NEW.store_id IS NOT NULL THEN
        SELECT owner_id INTO NEW.owner_id FROM stores WHERE id = NEW.store_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_set_booking_owner ON bookings;
CREATE TRIGGER tr_set_booking_owner
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_booking_owner();


-- 5. Cleanup
DROP PROCEDURE IF EXISTS secure_table;
