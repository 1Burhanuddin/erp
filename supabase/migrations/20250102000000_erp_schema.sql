-- MASTER SCHEMA for ERP System
-- This file defines the entire database structure.
-- It includes DROP statements for policies to ensure it can be re-run safely.

-- 1. Common / Shared Tables
-- Create Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    role TEXT, -- 'Supplier', 'Customer', 'Both', etc.
    gstin TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Deals Table (Lead Management)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    contact_id UUID REFERENCES public.contacts(id),
    value DECIMAL(12, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'New', -- 'New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Module
-- Create Product Categories Table
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Product Brands Table
CREATE TABLE IF NOT EXISTS public.product_brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Product Units Table
CREATE TABLE IF NOT EXISTS public.product_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., 'kg', 'pcs', 'liter'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category_id UUID REFERENCES public.product_categories(id),
    brand_id UUID REFERENCES public.product_brands(id),
    unit_id UUID REFERENCES public.product_units(id),
    purchase_price DECIMAL(10, 2) DEFAULT 0.00,
    sale_price DECIMAL(10, 2) DEFAULT 0.00,
    current_stock INTEGER DEFAULT 0,
    alert_quantity INTEGER DEFAULT 5,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Expenses Module
-- Create Expense Categories Table
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_no TEXT,
    category_id UUID REFERENCES public.expense_categories(id),
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    payment_method TEXT DEFAULT 'Cash', -- Cash, Bank, Card
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Purchase Module
-- Create Purchase Orders Table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_no TEXT NOT NULL UNIQUE,
    supplier_id UUID REFERENCES public.contacts(id),
    order_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Pending', -- Pending, Received, Cancelled
    total_amount DECIMAL(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Purchase Items Table
CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sales Module
-- Create Sales Orders Table
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_no TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.contacts(id),
    order_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Draft', -- Draft, Confirmed, Shipped, Delivered, Cancelled
    total_amount DECIMAL(12, 2) DEFAULT 0.00,
    paid_amount DECIMAL(12, 2) DEFAULT 0.00,
    payment_status TEXT DEFAULT 'Unpaid', -- Unpaid, Partial, Paid
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Sales Payments Table
CREATE TABLE IF NOT EXISTS public.sales_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'Cash', -- Cash, Card, UPI, Bank Transfer
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Sales Items Table
CREATE TABLE IF NOT EXISTS public.sales_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Helper to drop existing policies so we can re-create them safely
DO $$
BEGIN
    -- Contacts
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.contacts;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.contacts;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.contacts;
    DROP POLICY IF EXISTS "Enable insert access for anon" ON public.contacts;
    
    -- Deals
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.deals;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.deals;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.deals;

    -- Product Categories
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.product_categories;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.product_categories;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.product_categories;

    -- Product Brands
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.product_brands;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.product_brands;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.product_brands;

    -- Product Units
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.product_units;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.product_units;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.product_units;

    -- Products
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.products;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.products;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.products;

    -- Expense Categories
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.expense_categories;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.expense_categories;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.expense_categories;

    -- Expenses
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.expenses;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.expenses;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.expenses;
    DROP POLICY IF EXISTS "Enable insert access for anon" ON public.expenses;

    -- Purchase Orders
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.purchase_orders;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.purchase_orders;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.purchase_orders;

    -- Purchase Items
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.purchase_items;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.purchase_items;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.purchase_items;

    -- Sales Orders
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.sales_orders;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.sales_orders;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.sales_orders;

    -- Sales Items
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.sales_items;
    DROP POLICY IF EXISTS "Enable all access for anon" ON public.sales_items;
    DROP POLICY IF EXISTS "Enable read access for anon" ON public.sales_items;
END;
$$;

-- CREATE POLICIES
-- 1. Full Access for Authenticated Users (Keep this)
CREATE POLICY "Enable all access for authenticated users" ON public.contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.deals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.product_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.product_brands FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.product_units FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.expense_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.purchase_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.purchase_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.sales_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.sales_items FOR ALL USING (auth.role() = 'authenticated');

-- 2. Full Access for Anonymous (DEVELOPMENT ONLY - TO FIX 401 ERRORS)
-- We use 'ALL' to allow SELECT, INSERT, UPDATE, DELETE for anon users
CREATE POLICY "Enable all access for anon" ON public.contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON public.deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON public.product_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON public.product_brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON public.product_units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON public.expense_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON public.purchase_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON public.sales_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON public.sales_items FOR ALL USING (true) WITH CHECK (true);
