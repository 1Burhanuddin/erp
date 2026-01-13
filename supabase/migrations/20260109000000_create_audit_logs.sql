-- Create audit_logs table to track all changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;

-- Policy: Users can only see their own audit logs
CREATE POLICY "Users can view own audit logs"
ON public.audit_logs FOR SELECT
USING (user_id = auth.uid());

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields_array TEXT[];
    old_json JSONB;
    new_json JSONB;
BEGIN
    -- Determine action type
    IF TG_OP = 'DELETE' THEN
        old_json := to_jsonb(OLD);
        INSERT INTO public.audit_logs (
            user_id,
            table_name,
            record_id,
            action,
            old_data,
            new_data,
            changed_fields
        ) VALUES (
            COALESCE((OLD.user_id)::UUID, auth.uid()),
            TG_TABLE_NAME,
            OLD.id,
            'DELETE',
            old_json,
            NULL,
            ARRAY[]::TEXT[]
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        old_json := to_jsonb(OLD);
        new_json := to_jsonb(NEW);
        
        -- Find changed fields
        SELECT ARRAY_AGG(key)
        INTO changed_fields_array
        FROM jsonb_each(old_json)
        WHERE value IS DISTINCT FROM new_json->key;
        
        INSERT INTO public.audit_logs (
            user_id,
            table_name,
            record_id,
            action,
            old_data,
            new_data,
            changed_fields
        ) VALUES (
            COALESCE((NEW.user_id)::UUID, auth.uid()),
            TG_TABLE_NAME,
            NEW.id,
            'UPDATE',
            old_json,
            new_json,
            changed_fields_array
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        new_json := to_jsonb(NEW);
        INSERT INTO public.audit_logs (
            user_id,
            table_name,
            record_id,
            action,
            old_data,
            new_data,
            changed_fields
        ) VALUES (
            COALESCE((NEW.user_id)::UUID, auth.uid()),
            TG_TABLE_NAME,
            NEW.id,
            'INSERT',
            NULL,
            new_json,
            ARRAY[]::TEXT[]
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for key tables
-- Note: We'll add triggers for the most important tables
-- You can extend this to other tables as needed

-- Contacts
DROP TRIGGER IF EXISTS audit_contacts ON public.contacts;
CREATE TRIGGER audit_contacts
    AFTER INSERT OR UPDATE OR DELETE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

-- Products
DROP TRIGGER IF EXISTS audit_products ON public.products;
CREATE TRIGGER audit_products
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

-- Sales Orders
DROP TRIGGER IF EXISTS audit_sales_orders ON public.sales_orders;
CREATE TRIGGER audit_sales_orders
    AFTER INSERT OR UPDATE OR DELETE ON public.sales_orders
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

-- Purchase Orders
DROP TRIGGER IF EXISTS audit_purchase_orders ON public.purchase_orders;
CREATE TRIGGER audit_purchase_orders
    AFTER INSERT OR UPDATE OR DELETE ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

-- Expenses
DROP TRIGGER IF EXISTS audit_expenses ON public.expenses;
CREATE TRIGGER audit_expenses
    AFTER INSERT OR UPDATE OR DELETE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

-- Deals
DROP TRIGGER IF EXISTS audit_deals ON public.deals;
CREATE TRIGGER audit_deals
    AFTER INSERT OR UPDATE OR DELETE ON public.deals
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

-- Comment for documentation
COMMENT ON TABLE public.audit_logs IS 'Tracks all changes to key tables for audit purposes';
COMMENT ON COLUMN public.audit_logs.changed_fields IS 'Array of field names that were changed in UPDATE operations';
