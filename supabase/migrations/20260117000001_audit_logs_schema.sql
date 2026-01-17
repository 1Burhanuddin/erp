-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    table_name text NOT NULL,
    record_id text NOT NULL,
    action text NOT NULL, -- INSERT, UPDATE, DELETE
    old_data jsonb,
    new_data jsonb,
    changed_fields text[],
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow insert from trigger (or public for now since we record from API/App level?)
-- Usually audit logs are created via triggers in Supabase, but the app code suggests manual logging or hook based logging?
-- `useAuditLogs` in Step 265 reads from it.
-- Let's make it readable by authenticated users.

CREATE POLICY "Allow read access for authenticated users" ON public.audit_logs
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert access for authenticated users" ON public.audit_logs
FOR INSERT TO authenticated WITH CHECK (true);
