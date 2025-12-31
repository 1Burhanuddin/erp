-- Migration: Assign orphan data to the first registered user
-- Created: 2025-01-04
-- PRO TIP: You can run this in the Supabase SQL Editor to "claim" old data.

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the first user (usually the admin/developer in this context)
    SELECT id INTO target_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

    IF target_user_id IS NOT NULL THEN
        -- Link all orphan records to this user
        UPDATE public.contacts SET user_id = target_user_id WHERE user_id IS NULL;
        UPDATE public.deals SET user_id = target_user_id WHERE user_id IS NULL;
        
        UPDATE public.product_categories SET user_id = target_user_id WHERE user_id IS NULL;
        UPDATE public.product_brands SET user_id = target_user_id WHERE user_id IS NULL;
        UPDATE public.product_units SET user_id = target_user_id WHERE user_id IS NULL;
        UPDATE public.products SET user_id = target_user_id WHERE user_id IS NULL;
        
        UPDATE public.expense_categories SET user_id = target_user_id WHERE user_id IS NULL;
        UPDATE public.expenses SET user_id = target_user_id WHERE user_id IS NULL;
        
        UPDATE public.purchase_orders SET user_id = target_user_id WHERE user_id IS NULL;
        -- purchase_items are accessed via purchase_orders, so they might not need direct updating if policies use join
        -- but for completeness if we add user_id to items later (policy checks purchase_id, so it's fine)
        
        UPDATE public.sales_orders SET user_id = target_user_id WHERE user_id IS NULL;
        UPDATE public.sales_payments SET user_id = target_user_id WHERE user_id IS NULL;
        
        UPDATE public.stock_adjustments SET user_id = target_user_id WHERE user_id IS NULL;
        UPDATE public.sales_returns SET user_id = target_user_id WHERE user_id IS NULL;

        RAISE NOTICE 'Successfully assigned orphan data to user %', target_user_id;
    ELSE
        RAISE NOTICE 'No users found in auth.users. Please sign up first.';
    END IF;
END $$;
