-- Fix for Supabase Lint: function_search_path_mutable
-- Detects functions where the search_path parameter is not set.
-- remediates: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- 1. update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. create_audit_log
ALTER FUNCTION public.create_audit_log() SET search_path = public;

-- 3. get_my_store_id
ALTER FUNCTION public.get_my_store_id() SET search_path = public;

-- 4. handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 5. is_admin (Explicitly setting it again to be sure)
ALTER FUNCTION public.is_admin() SET search_path = public;

-- 6. set_booking_owner
ALTER FUNCTION public.set_booking_owner() SET search_path = public;

-- 7. get_store_products (Takes UUID argument)
ALTER FUNCTION public.get_store_products(UUID) SET search_path = public;

-- 8. handle_new_employee_signup (Condition as it was not found in static files)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE pg_proc.proname = 'handle_new_employee_signup' AND pg_namespace.nspname = 'public') THEN
        ALTER FUNCTION public.handle_new_employee_signup() SET search_path = public;
    END IF;
END $$;
