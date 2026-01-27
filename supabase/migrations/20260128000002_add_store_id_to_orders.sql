-- Migration to add store_id to purchase_orders and sales_orders
-- This is required for Multi-Store functionality and to fix 400 Bad Request errors on insert

-- 1. Add store_id to purchase_orders
ALTER TABLE public.purchase_orders 
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_purchase_orders_store_id ON public.purchase_orders(store_id);

-- 2. Add store_id to sales_orders
ALTER TABLE public.sales_orders 
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_sales_orders_store_id ON public.sales_orders(store_id);

-- 3. Optional: Backfill store_id for existing records if possible?
-- Since we don't know which store they belong to easily without logic, we leave them NULL.
-- But if strict RLS checks store_id, old records might disappear from views filtering by store_id.
-- We can attempt to infer from owner_id if each owner has only 1 store.
-- For now, we leave as NULL.
