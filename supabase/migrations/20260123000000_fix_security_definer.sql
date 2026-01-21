-- Fix for Supabase Lint: security_definer_view
-- View `public.website_products` is defined with the SECURITY DEFINER property (default behavior without security_invoker=true)
-- remediates: https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view

-- Determine if the view exists and alter it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'website_products' AND schemaname = 'public') THEN
        ALTER VIEW public.website_products SET (security_invoker = true);
    END IF;
END $$;
