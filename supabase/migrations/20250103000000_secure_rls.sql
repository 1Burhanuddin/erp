-- Migration: Enable Row Level Security and Multi-tenancy
-- Created: 2025-01-03

-- 1. Ensure missing tables exist (Safety check based on previous context)
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_no TEXT,
    adjustment_date DATE DEFAULT CURRENT_DATE,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stock_adjustment_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    adjustment_id UUID REFERENCES public.stock_adjustments(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL, -- Positive for addition, Negative for subtraction
    type TEXT, -- 'Addition' or 'Subtraction'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales_returns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES public.sales_orders(id),
    return_date DATE DEFAULT CURRENT_DATE,
    reason TEXT,
    total_refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales_return_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    return_id UUID REFERENCES public.sales_returns(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add user_id to all parent tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'contacts', 
            'deals', 
            'product_categories', 
            'product_brands', 
            'product_units', 
            'products', 
            'expense_categories', 
            'expenses', 
            'purchase_orders', 
            'sales_orders', 
            'sales_payments',
            'stock_adjustments',
            'sales_returns'
        ])
    LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()', t);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- Drop existing permissive policies
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Enable all access for anon" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Enable read access for anon" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Enable insert access for anon" ON public.%I', t);
        EXCEPTION WHEN OTHERS THEN NULL; END;

        -- Create restrictive policies (CRUD)
        EXECUTE format('CREATE POLICY "Users can view own data" ON public.%I FOR SELECT USING (user_id = auth.uid())', t);
        EXECUTE format('CREATE POLICY "Users can insert own data" ON public.%I FOR INSERT WITH CHECK (user_id = auth.uid())', t);
        EXECUTE format('CREATE POLICY "Users can update own data" ON public.%I FOR UPDATE USING (user_id = auth.uid())', t);
        EXECUTE format('CREATE POLICY "Users can delete own data" ON public.%I FOR DELETE USING (user_id = auth.uid())', t);
    END LOOP;
END;
$$;

-- 3. RLS for Child Tables (Access via Parent)
-- Purchase Items
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.purchase_items;
DROP POLICY IF EXISTS "Enable all access for anon" ON public.purchase_items;
CREATE POLICY "Users can view own purchase items" ON public.purchase_items FOR SELECT USING (
    purchase_id IN (SELECT id FROM public.purchase_orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own purchase items" ON public.purchase_items FOR INSERT WITH CHECK (
    purchase_id IN (SELECT id FROM public.purchase_orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own purchase items" ON public.purchase_items FOR UPDATE USING (
    purchase_id IN (SELECT id FROM public.purchase_orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own purchase items" ON public.purchase_items FOR DELETE USING (
    purchase_id IN (SELECT id FROM public.purchase_orders WHERE user_id = auth.uid())
);

-- Sales Items
ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.sales_items;
DROP POLICY IF EXISTS "Enable all access for anon" ON public.sales_items;
CREATE POLICY "Users can view own sales items" ON public.sales_items FOR SELECT USING (
    sale_id IN (SELECT id FROM public.sales_orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own sales items" ON public.sales_items FOR INSERT WITH CHECK (
    sale_id IN (SELECT id FROM public.sales_orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own sales items" ON public.sales_items FOR UPDATE USING (
    sale_id IN (SELECT id FROM public.sales_orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own sales items" ON public.sales_items FOR DELETE USING (
    sale_id IN (SELECT id FROM public.sales_orders WHERE user_id = auth.uid())
);

-- Stock Adjustment Items
ALTER TABLE public.stock_adjustment_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.stock_adjustment_items;
DROP POLICY IF EXISTS "Enable all access for anon" ON public.stock_adjustment_items;
CREATE POLICY "Users can view own adj items" ON public.stock_adjustment_items FOR SELECT USING (
    adjustment_id IN (SELECT id FROM public.stock_adjustments WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own adj items" ON public.stock_adjustment_items FOR INSERT WITH CHECK (
    adjustment_id IN (SELECT id FROM public.stock_adjustments WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own adj items" ON public.stock_adjustment_items FOR DELETE USING (
    adjustment_id IN (SELECT id FROM public.stock_adjustments WHERE user_id = auth.uid())
);

-- Sales Return Items
ALTER TABLE public.sales_return_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.sales_return_items;
DROP POLICY IF EXISTS "Enable all access for anon" ON public.sales_return_items;
CREATE POLICY "Users can view own return items" ON public.sales_return_items FOR SELECT USING (
    return_id IN (SELECT id FROM public.sales_returns WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own return items" ON public.sales_return_items FOR INSERT WITH CHECK (
    return_id IN (SELECT id FROM public.sales_returns WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own return items" ON public.sales_return_items FOR DELETE USING (
    return_id IN (SELECT id FROM public.sales_returns WHERE user_id = auth.uid())
);
