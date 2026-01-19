DO $$
DECLARE
    r RECORD;
    master_id UUID;
BEGIN
    -- Loop through each unique duplicate group (name, percentage) having > 1 entry
    FOR r IN 
        SELECT name, percentage
        FROM public.tax_rates
        GROUP BY name, percentage
        HAVING COUNT(*) > 1
    LOOP
        -- 1. Identify the Master ID (Oldest created)
        SELECT id INTO master_id
        FROM public.tax_rates
        WHERE name = r.name AND percentage = r.percentage
        ORDER BY created_at ASC
        LIMIT 1;

        -- 2. Update referencing tables to point to Master ID for all other IDs in this group
        -- Update sales_items
        UPDATE public.sales_items
        SET tax_rate_id = master_id
        WHERE tax_rate_id IN (
            SELECT id FROM public.tax_rates 
            WHERE name = r.name AND percentage = r.percentage AND id != master_id
        );

        -- Update purchase_items
        UPDATE public.purchase_items
        SET tax_rate_id = master_id
        WHERE tax_rate_id IN (
            SELECT id FROM public.tax_rates 
            WHERE name = r.name AND percentage = r.percentage AND id != master_id
        );

        -- 3. Delete the duplicates
        DELETE FROM public.tax_rates
        WHERE name = r.name AND percentage = r.percentage AND id != master_id;
        
        RAISE NOTICE 'Cleaned up duplicates for % (%) keeping ID %', r.name, r.percentage, master_id;
    END LOOP;
END $$;

-- Add Audit Log Trigger for Tax Rates
DROP TRIGGER IF EXISTS audit_tax_rates ON public.tax_rates;

CREATE TRIGGER audit_tax_rates
    AFTER INSERT OR UPDATE OR DELETE ON public.tax_rates
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();
