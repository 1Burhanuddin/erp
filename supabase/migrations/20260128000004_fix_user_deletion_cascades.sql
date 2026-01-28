-- Migration to fix user deletion (auth.users)
-- This ensures that when a user is deleted from Supabase Authentication, 
-- all related records in the public schema are automatically cleaned up.

-- 1. Employees table (Secondary link to Auth)
ALTER TABLE public.employees
DROP CONSTRAINT IF EXISTS employees_user_id_fkey;

ALTER TABLE public.employees
ADD CONSTRAINT employees_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 2. Employee Tasks table (created_by reference)
ALTER TABLE public.employee_tasks
DROP CONSTRAINT IF EXISTS employee_tasks_created_by_fkey;

ALTER TABLE public.employee_tasks
ADD CONSTRAINT employee_tasks_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. Bookings table (user_id reference)
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 4. Audit Logs (user_id reference)
-- We use SET NULL for audit logs typically to preserve history, 
-- but if the goal is "Complete Cleanup", CASCADE might be preferred.
-- However, existing schema uses SET NULL, so we keep it or change it.
-- User asked for "fixing" deletion, so CASCADE is more aggressive for cleanup.
ALTER TABLE public.audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

ALTER TABLE public.audit_logs
ADD CONSTRAINT audit_logs_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 5. Multitenancy - owner_id Cascade
-- These were created using a helper procedure in 20260118000004_complete_multitenancy.sql
-- We need to manually update them now to ensure they CASCADE.

-- List of tables using owner_id from 20260118000004_complete_multitenancy.sql:
-- products, product_categories, product_sub_categories, product_brands, product_units,
-- stores, contacts, deals, expenses, expense_categories, purchase_orders, sales_orders,
-- purchase_returns, sales_returns, stock_adjustments, bookings, sales_items, purchase_items,
-- purchase_return_items, sales_return_items, stock_adjustment_items, sales_payments, store_products

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'owner_id' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I_owner_id_fkey', t, t);
        EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE', t, t);
    END LOOP;
END $$;
