-- Add gstin column to contacts
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS gstin text;
