-- Fix "Function Search Path Mutable" warnings by explicitly setting search_path to public
-- This prevents malicious users from overriding operators or functions by manipulating the search path.

-- 1. handle_new_user (Trigger Function)
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 2. create_invoice_from_task (Trigger Function)
ALTER FUNCTION public.create_invoice_from_task() SET search_path = public;

-- 3. get_employee_performance (RPC)
ALTER FUNCTION public.get_employee_performance(DATE, DATE, UUID) SET search_path = public;

-- 4. is_physical_product (Helper)
ALTER FUNCTION public.is_physical_product(UUID) SET search_path = public;

-- 5. handle_sales_inventory (Trigger Function)
ALTER FUNCTION public.handle_sales_inventory() SET search_path = public;

-- 6. handle_purchase_inventory (Trigger Function)
ALTER FUNCTION public.handle_purchase_inventory() SET search_path = public;
