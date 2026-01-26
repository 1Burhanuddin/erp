-- Seed Data Script
-- Usage: Replace 'YOUR_USER_ID_HERE' with your actual Supabase User UUID (found in Authentication > Users)
-- Then run this in the Supabase SQL Editor.

DO $$
DECLARE
    -- REPLACE THIS WITH YOUR USER ID
    v_owner_id UUID := '62bab0d7-fc6a-4501-8206-c89d231bdf3a'::UUID; 
    
    -- Store IDs
    v_store_main_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    -- Category IDs
    v_cat_glass_id UUID := 'c1111111-1111-1111-1111-111111111111';
    v_cat_alum_id UUID := 'c2222222-2222-2222-2222-222222222222';
    v_cat_hard_id UUID := 'c3333333-3333-3333-3333-333333333333';
    
    -- Brand IDs
    v_brand_sg_id UUID := 'b1111111-1111-1111-1111-111111111111';
    v_brand_jin_id UUID := 'b2222222-2222-2222-2222-222222222222';
    v_brand_dor_id UUID := 'b3333333-3333-3333-3333-333333333333';
    
    -- Unit IDs (Prefix 5)
    v_unit_sqft_id UUID := '55555555-5555-5555-5555-555555555555';
    v_unit_ft_id UUID := '55555555-5555-5555-5555-555555555556';
    v_unit_pcs_id UUID := '55555555-5555-5555-5555-555555555557';
    v_unit_kg_id UUID := '55555555-5555-5555-5555-555555555558';
    
    -- Product IDs (Prefix 6)
    v_prod_12mm_id UUID := '66666666-6666-6666-6666-666666666661';
    v_prod_5mm_id UUID := '66666666-6666-6666-6666-666666666662';
    v_prod_2x1_id UUID := '66666666-6666-6666-6666-666666666663';
    v_prod_track_id UUID := '66666666-6666-6666-6666-666666666664';
    v_prod_fbrack_id UUID := '66666666-6666-6666-6666-666666666665';
    v_prod_dbrack_id UUID := '66666666-6666-6666-6666-666666666666';
    
    -- Contact IDs (Prefix d - Valid)
    v_cust_alum_fab_id UUID := 'd1111111-1111-1111-1111-111111111111';
    v_supp_glass_id UUID := 'd2222222-2222-2222-2222-222222222222';
    v_supp_alum_id UUID := 'd3333333-3333-3333-3333-333333333333';
    
    -- Sales IDs (Prefix 7)
    v_sale_001_id UUID := '77777777-7777-7777-7777-777777777771';
    
    -- Purchase IDs (Prefix 8)
    v_purch_001_id UUID := '88888888-8888-8888-8888-888888888881';
    
    -- Expense Category IDs
    v_exp_cat_trans_id UUID := 'e1111111-1111-1111-1111-111111111111';
    v_exp_cat_labour_id UUID := 'e2222222-2222-2222-2222-222222222222';
    v_exp_cat_consum_id UUID := 'e3333333-3333-3333-3333-333333333333';
    
BEGIN

    -- 1. Create Dummy Store
    INSERT INTO public.stores (id, name, address, phone, is_active, owner_id)
    VALUES
        (v_store_main_id, 'City Glaas & Aluminium', 'Industrial Area, 4th Cross', '9876543210', true, v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;

    -- 2. Create Categories
    INSERT INTO public.product_categories (id, name, description, owner_id)
    VALUES
        (v_cat_glass_id, 'Glass', 'Types of Glasses (Toughened, Clear, etc)', v_owner_id),
        (v_cat_alum_id, 'Aluminium Sections', 'Profiles and pipes', v_owner_id),
        (v_cat_hard_id, 'Hardware', 'Fittings and accessories', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;

    -- 3. Create Brands
    INSERT INTO public.product_brands (id, name, owner_id)
    VALUES
        (v_brand_sg_id, 'Saint-Gobain', v_owner_id),
        (v_brand_jin_id, 'Jindal', v_owner_id),
        (v_brand_dor_id, 'Dorma', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;

    -- 4. Create Units
    INSERT INTO public.product_units (id, name, owner_id)
    VALUES
        (v_unit_sqft_id, 'sq.ft', v_owner_id),
        (v_unit_ft_id, 'ft', v_owner_id),
        (v_unit_pcs_id, 'pcs', v_owner_id),
        (v_unit_kg_id, 'kg', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;

    -- 5. Create Products
    INSERT INTO public.products (id, name, sku, category_id, brand_id, unit_id, purchase_price, sale_price, current_stock, type, owner_id)
    VALUES
        (v_prod_12mm_id, '12mm Toughened Glass', 'SG-12MM-T', v_cat_glass_id, v_brand_sg_id, v_unit_sqft_id, 120.00, 180.00, 500, 'Product', v_owner_id),
        (v_prod_5mm_id, '5mm Clear Glass', 'SG-5MM-C', v_cat_glass_id, v_brand_sg_id, v_unit_sqft_id, 45.00, 75.00, 1000, 'Product', v_owner_id),
        (v_prod_2x1_id, '2x1 Rectangular Tube', 'JIN-2X1-SIL', v_cat_alum_id, v_brand_jin_id, v_unit_kg_id, 240.00, 320.00, 200, 'Product', v_owner_id),
        (v_prod_track_id, 'Bottom Track 2 Track', 'JIN-TRK-2', v_cat_alum_id, v_brand_jin_id, v_unit_ft_id, 80.00, 120.00, 300, 'Product', v_owner_id),
        (v_prod_fbrack_id, 'F Bracket 2 inch', 'HW-FB-002', v_cat_hard_id, v_brand_dor_id, v_unit_pcs_id, 15.00, 45.00, 500, 'Product', v_owner_id),
        (v_prod_dbrack_id, 'D Bracket', 'HW-DB-001', v_cat_hard_id, v_brand_dor_id, v_unit_pcs_id, 25.00, 65.00, 400, 'Product', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;

    -- Link Products to Store
    INSERT INTO public.store_products (store_id, product_id, is_active, owner_id)
    VALUES
        (v_store_main_id, v_prod_12mm_id, true, v_owner_id),
        (v_store_main_id, v_prod_5mm_id, true, v_owner_id),
        (v_store_main_id, v_prod_2x1_id, true, v_owner_id),
        (v_store_main_id, v_prod_track_id, true, v_owner_id),
        (v_store_main_id, v_prod_fbrack_id, true, v_owner_id),
        (v_store_main_id, v_prod_dbrack_id, true, v_owner_id)
    ON CONFLICT (store_id, product_id) DO UPDATE SET owner_id = v_owner_id;

    -- 6. Create Contacts
    INSERT INTO public.contacts (id, name, email, phone, role, company, address, owner_id)
    VALUES
        (v_cust_alum_fab_id, 'A-1 Fabricators', 'fab@example.com', '9876500001', 'Customer', 'A-1 Aluminium', 'Industrial Estate', v_owner_id),
        (v_supp_glass_id, 'National Glass House', 'ngh@example.com', '9876500002', 'Supplier', 'National Glass', 'Market Road', v_owner_id),
        (v_supp_alum_id, 'Metal World', 'metal@example.com', '9876500003', 'Supplier', 'Metal World', 'Highway', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;

    -- 7. Purchase Order
    INSERT INTO public.purchase_orders (id, order_no, supplier_id, order_date, status, total_amount, notes, owner_id)
    VALUES
        (v_purch_001_id, 'PO-001', v_supp_glass_id, CURRENT_DATE - 5, 'Received', 24000.00, 'Stock Replenishment', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;
    
    INSERT INTO public.purchase_items (purchase_id, product_id, quantity, unit_price, subtotal, owner_id)
    VALUES 
        (v_purch_001_id, v_prod_12mm_id, 200, 120.00, 24000.00, v_owner_id) 
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;

    -- 8. Sales Order
    INSERT INTO public.sales_orders (id, order_no, customer_id, order_date, status, total_amount, paid_amount, payment_status, notes, owner_id)
    VALUES
        (v_sale_001_id, 'SO-001', v_cust_alum_fab_id, CURRENT_DATE, 'Confirmed', 8030.00, 2000.00, 'Partial', 'Project: Office Partition', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;

    INSERT INTO public.sales_items (sale_id, product_id, quantity, unit_price, subtotal, owner_id)
    VALUES
        (v_sale_001_id, v_prod_12mm_id, 10, 180.00, 1800.00, v_owner_id),    -- Partition Glass
        (v_sale_001_id, v_prod_2x1_id, 15, 320.00, 4800.00, v_owner_id),     -- Frame
        (v_sale_001_id, v_prod_fbrack_id, 20, 45.00, 900.00, v_owner_id),    -- Connectors
        (v_sale_001_id, v_prod_dbrack_id, 8, 65.00, 520.00, v_owner_id)      -- Supports
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;

    -- 9. Create Expense Categories & Expenses
    INSERT INTO public.expense_categories (id, name, owner_id)
    VALUES
        (v_exp_cat_trans_id, 'Transportation', v_owner_id),
        (v_exp_cat_labour_id, 'Labour', v_owner_id),
        (v_exp_cat_consum_id, 'Consumables', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;

    INSERT INTO public.expenses (reference_no, category_id, amount, expense_date, description, payment_method, owner_id)
    VALUES
        ('EXP-001', v_exp_cat_trans_id, 1500.00, CURRENT_DATE, 'Tempo Charge for Delivery','Cash', v_owner_id),
        ('EXP-002', v_exp_cat_consum_id, 450.00, CURRENT_DATE - 1, 'Cutting Oil & Blades', 'Cash', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = v_owner_id;

END $$;
