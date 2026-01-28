-- Glass and Mirror Shop Seed Data Script
-- Usage: Run this in the Supabase SQL Editor.
-- Target: Initialize a fresh store with glass industry specific data.

DO $$
DECLARE
    -- Specific ID provided by the user
    v_owner_id UUID := 'fd021e55-08ca-4236-8b75-6bbdaa7918a5'::UUID; 
    
    -- Store Placeholder (Will link to the first store found if none provided)
    v_store_id UUID;
    
    -- Category IDs
    v_cat_glass_id UUID := 'c0000000-0000-0000-0000-000000000001';
    v_cat_mirror_id UUID := 'c0000000-0000-0000-0000-000000000002';
    v_cat_hard_id UUID := 'c0000000-0000-0000-0000-000000000003';
    
    -- Sub-Category IDs
    v_sub_shelf_id UUID := 'b0000000-0000-0000-0000-000000000001';
    v_sub_corner_id UUID := 'b0000000-0000-0000-0000-000000000002';
    v_sub_bracket_id UUID := 'b0000000-0000-0000-0000-000000000003';
    v_sub_acc_id UUID := 'b0000000-0000-0000-0000-000000000004';
    
    -- Unit IDs
    v_unit_pcs_id UUID;
    v_unit_sqft_id UUID;
    
    -- Supplier ID
    v_supp_id UUID := 'f0000000-0000-0000-0000-000000000001';
    
    -- Purchase ID
    v_purch_id UUID := 'e0000000-0000-0000-0000-000000000001';

BEGIN
    -- 0. Get current store and units
    SELECT id INTO v_store_id FROM public.stores WHERE owner_id = v_owner_id LIMIT 1;
    
    -- Fallback: If no store found for this user, get ANY store to at least run the script
    IF v_store_id IS NULL THEN
        SELECT id INTO v_store_id FROM public.stores LIMIT 1;
    END IF;

    SELECT id INTO v_unit_pcs_id FROM public.product_units WHERE name ILIKE 'pcs' AND (owner_id = v_owner_id OR owner_id IS NULL) LIMIT 1;
    SELECT id INTO v_unit_sqft_id FROM public.product_units WHERE name ILIKE 'sq.ft' AND (owner_id = v_owner_id OR owner_id IS NULL) LIMIT 1;

    -- Update or create units
    IF v_unit_pcs_id IS NOT NULL THEN
        UPDATE public.product_units SET owner_id = v_owner_id WHERE id = v_unit_pcs_id;
    ELSE
        v_unit_pcs_id := gen_random_uuid();
        INSERT INTO public.product_units (id, name, owner_id) VALUES (v_unit_pcs_id, 'pcs', v_owner_id);
    END IF;

    IF v_unit_sqft_id IS NOT NULL THEN
        UPDATE public.product_units SET owner_id = v_owner_id WHERE id = v_unit_sqft_id;
    ELSE
        v_unit_sqft_id := gen_random_uuid();
        INSERT INTO public.product_units (id, name, owner_id) VALUES (v_unit_sqft_id, 'sq.ft', v_owner_id);
    END IF;

    -- 1. Categories (Using fixed IDs so we can re-parent easily)
    INSERT INTO public.product_categories (id, name, description, owner_id) VALUES
    (v_cat_glass_id, 'Glass Products', 'Glass sheets and finished glass items', v_owner_id),
    (v_cat_mirror_id, 'Mirrors', 'Various types of mirrors and glass decor', v_owner_id),
    (v_cat_hard_id, 'Hardware & Fittings', 'Brackets, studs, and mounting hardware', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = EXCLUDED.owner_id;

    -- 2. Sub-Categories
    INSERT INTO public.product_sub_categories (id, name, category_id, description, owner_id) VALUES
    (v_sub_shelf_id, 'Glass Shelves', v_cat_glass_id, 'Rectangular and shaped shelves', v_owner_id),
    (v_sub_corner_id, 'Corner Shelves', v_cat_glass_id, 'Triangular/Sector corner shelves', v_owner_id),
    (v_sub_bracket_id, 'Brackets', v_cat_hard_id, 'Support brackets for shelves', v_owner_id),
    (v_sub_acc_id, 'Accessories', v_cat_hard_id, 'Caps, studs, and small fittings', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = EXCLUDED.owner_id;

    -- 3. Supplier
    INSERT INTO public.contacts (id, name, role, company, owner_id) VALUES
    (v_supp_id, 'Star Glass & Fittings Suppliers', 'Supplier', 'Star Glass Corp', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET owner_id = EXCLUDED.owner_id;

    -- 4. Products (Shelves - Rectangular)
    FOR size_idx IN 1..6 LOOP
        DECLARE
            v_size TEXT := CASE size_idx 
                WHEN 1 THEN '12x6' WHEN 2 THEN '12x9' WHEN 3 THEN '15x6' 
                WHEN 4 THEN '15x9' WHEN 5 THEN '18x6' WHEN 6 THEN '18x9' 
            END;
            v_base_price DECIMAL := 150 + (size_idx * 50);
        BEGIN
            -- White, No Railing
            INSERT INTO public.products (name, sku, category_id, sub_category_id, unit_id, purchase_price, sale_price, current_stock, owner_id)
            VALUES ('Glass Shelf ' || v_size || ' White', 'SH-W-' || v_size, v_cat_glass_id, v_sub_shelf_id, v_unit_pcs_id, v_base_price, v_base_price * 1.5, 20, v_owner_id)
            ON CONFLICT (sku) DO UPDATE SET 
                owner_id = EXCLUDED.owner_id,
                purchase_price = EXCLUDED.purchase_price,
                sale_price = EXCLUDED.sale_price,
                category_id = EXCLUDED.category_id,
                sub_category_id = EXCLUDED.sub_category_id;
            
            -- Black, No Railing
            INSERT INTO public.products (name, sku, category_id, sub_category_id, unit_id, purchase_price, sale_price, current_stock, owner_id)
            VALUES ('Glass Shelf ' || v_size || ' Black', 'SH-B-' || v_size, v_cat_glass_id, v_sub_shelf_id, v_unit_pcs_id, v_base_price + 20, (v_base_price + 20) * 1.5, 20, v_owner_id)
            ON CONFLICT (sku) DO UPDATE SET 
                owner_id = EXCLUDED.owner_id,
                purchase_price = EXCLUDED.purchase_price,
                sale_price = EXCLUDED.sale_price,
                category_id = EXCLUDED.category_id,
                sub_category_id = EXCLUDED.sub_category_id;
            
            -- White, With Railing
            INSERT INTO public.products (name, sku, category_id, sub_category_id, unit_id, purchase_price, sale_price, current_stock, owner_id)
            VALUES ('Glass Shelf ' || v_size || ' White (Railing)', 'SH-WR-' || v_size, v_cat_glass_id, v_sub_shelf_id, v_unit_pcs_id, v_base_price + 100, (v_base_price + 100) * 1.5, 10, v_owner_id)
            ON CONFLICT (sku) DO UPDATE SET 
                owner_id = EXCLUDED.owner_id,
                purchase_price = EXCLUDED.purchase_price,
                sale_price = EXCLUDED.sale_price,
                category_id = EXCLUDED.category_id,
                sub_category_id = EXCLUDED.sub_category_id;
        END;
    END LOOP;

    -- 5. Products (Corner Shelves)
    FOR csize_idx IN 1..5 LOOP
        DECLARE
            v_csize TEXT := CASE csize_idx 
                WHEN 1 THEN '6 inch' WHEN 2 THEN '9 inch' WHEN 3 THEN '12 inch' 
                WHEN 4 THEN '15 inch' WHEN 5 THEN '18 inch' 
            END;
            v_csize_val TEXT := CASE csize_idx WHEN 1 THEN '6' WHEN 2 THEN '9' WHEN 3 THEN '12' WHEN 4 THEN '15' WHEN 5 THEN '18' END;
            v_cprice DECIMAL := 80 + (csize_idx * 40);
        BEGIN
            INSERT INTO public.products (name, sku, category_id, sub_category_id, unit_id, purchase_price, sale_price, current_stock, owner_id)
            VALUES ('Corner Shelf ' || v_csize || ' White', 'CS-W-' || v_csize_val, v_cat_glass_id, v_sub_corner_id, v_unit_pcs_id, v_cprice, v_cprice * 1.5, 15, v_owner_id)
            ON CONFLICT (sku) DO UPDATE SET 
                owner_id = EXCLUDED.owner_id,
                category_id = EXCLUDED.category_id,
                sub_category_id = EXCLUDED.sub_category_id;

            INSERT INTO public.products (name, sku, category_id, sub_category_id, unit_id, purchase_price, sale_price, current_stock, owner_id)
            VALUES ('Corner Shelf ' || v_csize || ' Black', 'CS-B-' || v_csize_val, v_cat_glass_id, v_sub_corner_id, v_unit_pcs_id, v_cprice + 15, (v_cprice + 15) * 1.5, 15, v_owner_id)
            ON CONFLICT (sku) DO UPDATE SET 
                owner_id = EXCLUDED.owner_id,
                category_id = EXCLUDED.category_id,
                sub_category_id = EXCLUDED.sub_category_id;
            
            IF csize_idx >= 3 THEN
                INSERT INTO public.products (name, sku, category_id, sub_category_id, unit_id, purchase_price, sale_price, current_stock, owner_id)
                VALUES ('Corner Shelf ' || v_csize || ' White (Railing)', 'CS-WR-' || v_csize_val, v_cat_glass_id, v_sub_corner_id, v_unit_pcs_id, v_cprice + 80, (v_cprice + 80) * 1.5, 10, v_owner_id)
                ON CONFLICT (sku) DO UPDATE SET 
                    owner_id = EXCLUDED.owner_id,
                    category_id = EXCLUDED.category_id,
                    sub_category_id = EXCLUDED.sub_category_id;

                INSERT INTO public.products (name, sku, category_id, sub_category_id, unit_id, purchase_price, sale_price, current_stock, owner_id)
                VALUES ('Corner Shelf ' || v_csize || ' Black (Railing)', 'CS-BR-' || v_csize_val, v_cat_glass_id, v_sub_corner_id, v_unit_pcs_id, v_cprice + 95, (v_cprice + 95) * 1.5, 10, v_owner_id)
                ON CONFLICT (sku) DO UPDATE SET 
                    owner_id = EXCLUDED.owner_id,
                    category_id = EXCLUDED.category_id,
                    sub_category_id = EXCLUDED.sub_category_id;
            END IF;
        END;
    END LOOP;

    -- Hardware & Mirrors (Continue re-parenting)
    INSERT INTO public.products (name, sku, category_id, sub_category_id, unit_id, purchase_price, sale_price, current_stock, owner_id) VALUES
    ('F Bracket 4 inch (6-12mm)', 'HW-FB-4', v_cat_hard_id, v_sub_bracket_id, v_unit_pcs_id, 40,  80, 100, v_owner_id),
    ('F Bracket 6 inch (6-12mm)', 'HW-FB-6', v_cat_hard_id, v_sub_bracket_id, v_unit_pcs_id, 60, 120, 100, v_owner_id),
    ('F Bracket 8 inch (6-12mm)', 'HW-FB-8', v_cat_hard_id, v_sub_bracket_id, v_unit_pcs_id, 80, 160, 100, v_owner_id),
    ('D Bracket (Steel) for Corners', 'HW-DB-ST', v_cat_hard_id, v_sub_bracket_id, v_unit_pcs_id, 35, 75, 200, v_owner_id),
    ('D Bracket (Aluminium) for Corners', 'HW-DB-AL', v_cat_hard_id, v_sub_bracket_id, v_unit_pcs_id, 30, 65, 200, v_owner_id)
    ON CONFLICT (sku) DO UPDATE SET owner_id = EXCLUDED.owner_id, category_id = EXCLUDED.category_id, sub_category_id = EXCLUDED.sub_category_id;

    INSERT INTO public.products (name, sku, category_id, unit_id, purchase_price, sale_price, current_stock, owner_id) VALUES
    ('Mirror 12x30 inch (5mm)', 'MIR-RECT-1230', v_cat_mirror_id, v_unit_pcs_id, 450, 850, 15, v_owner_id),
    ('Mirror 12x48 inch (5mm)', 'MIR-RECT-1248', v_cat_mirror_id, v_unit_pcs_id, 650, 1200, 15, v_owner_id),
    ('Mirror 12 inch Round (5mm)', 'MIR-RND-12', v_cat_mirror_id, v_unit_pcs_id, 350, 650, 10, v_owner_id),
    ('Mirror 24 inch Round (5mm)', 'MIR-RND-24', v_cat_mirror_id, v_unit_pcs_id, 850, 1600, 10, v_owner_id),
    ('Mirror 12x30 inch Oval (5mm)', 'MIR-OVL-1230', v_cat_mirror_id, v_unit_pcs_id, 550, 950, 10, v_owner_id)
    ON CONFLICT (sku) DO UPDATE SET owner_id = EXCLUDED.owner_id, category_id = EXCLUDED.category_id;

    INSERT INTO public.products (name, sku, category_id, sub_category_id, unit_id, purchase_price, sale_price, current_stock, owner_id, description) VALUES
    ('Mirror Studs (Pack of 2)', 'HW-STUD-P2', v_cat_hard_id, v_sub_acc_id, v_unit_pcs_id, 30, 50, 500, v_owner_id, '1 inch height, set of 2 pieces'),
    ('Mirror Caps (Pack of 2)', 'HW-CAP-P2', v_cat_hard_id, v_sub_acc_id, v_unit_pcs_id, 25, 50, 500, v_owner_id, 'Standard size plastic caps, set of 2')
    ON CONFLICT (sku) DO UPDATE SET owner_id = EXCLUDED.owner_id, category_id = EXCLUDED.category_id, sub_category_id = EXCLUDED.sub_category_id;

    -- 9. Initial Purchase Order
    -- Fix: If a PO with this number exists but has a different ID, delete it first to maintain the seed's fixed ID
    DELETE FROM public.purchase_orders WHERE order_no = 'PO-INIT-GLASS' AND id != v_purch_id;
    
    INSERT INTO public.purchase_orders (id, order_no, supplier_id, order_date, status, total_amount, notes, owner_id)
    VALUES (v_purch_id, 'PO-INIT-GLASS', v_supp_id, CURRENT_DATE, 'Received', 50000.00, 'Initial setup stock', v_owner_id)
    ON CONFLICT (id) DO UPDATE SET 
        owner_id = EXCLUDED.owner_id,
        order_no = EXCLUDED.order_no;

    -- 10. Link products to store
    INSERT INTO public.store_products (store_id, product_id, is_active, owner_id)
    SELECT v_store_id, id, true, v_owner_id 
    FROM public.products 
    WHERE owner_id = v_owner_id
    ON CONFLICT (store_id, product_id) DO UPDATE SET owner_id = EXCLUDED.owner_id;

END $$;
