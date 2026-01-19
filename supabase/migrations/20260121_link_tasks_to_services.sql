-- Link Employee Tasks to Services (Products table)

-- 1. Add service_id to employee_tasks table
ALTER TABLE public.employee_tasks
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.products(id);

-- 2. Add sales_order_id to employee_tasks (to track generated invoice/sale later)
ALTER TABLE public.employee_tasks
ADD COLUMN IF NOT EXISTS sales_order_id UUID REFERENCES public.sales_orders(id);

-- 3. Ensure products table has 'type' column (if not already) 
-- (It likely does based on usage, but safe to verify or add index)
-- Check checking existence cannot be done easily in SQL cleanly without DO block, 
-- but we can just leave it if we trust the app usage.
-- Let's just create an index on type for faster filtering of 'Service'
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
