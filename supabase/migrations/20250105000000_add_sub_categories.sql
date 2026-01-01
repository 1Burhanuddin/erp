-- Migration: Add Product Sub Categories
-- Created: 2025-01-05

-- 1. Create Product Sub Categories Table
CREATE TABLE IF NOT EXISTS public.product_sub_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add sub_category_id to Products Table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sub_category_id UUID REFERENCES public.product_sub_categories(id);

-- 3. Enable RLS
ALTER TABLE public.product_sub_categories ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Helper to drop existing policies so we can re-create them safely
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.product_sub_categories;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.product_sub_categories;
END;
$$;

-- Full Access for Authenticated Users
CREATE POLICY "Enable all access for authenticated users" ON public.product_sub_categories FOR ALL USING (auth.role() = 'authenticated');

-- Full Access for Anonymous (DEVELOPMENT ONLY)
CREATE POLICY "Enable all access for anon" ON public.product_sub_categories FOR ALL USING (true) WITH CHECK (true);
