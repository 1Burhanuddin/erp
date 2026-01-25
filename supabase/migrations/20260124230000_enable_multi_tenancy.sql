-- Migration to add owner_id to stores for Multi-Tenancy isolation
-- This ensures that "John" only sees stores he owns, and "Jay" sees his.

-- 1. Add owner_id to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- 2. Update existing stores (optional: partial fix for dev env)
-- If there are existing stores without owner, we might want to assign them or leave them null.
-- For now, we leave them null, but new stores MUST have an owner if created by 'handle_new_user'.

-- 3. Update the handle_new_user trigger to set owner_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_employee_id UUID;
  v_store_id UUID;
BEGIN
  -- Check for existing employee invite
  SELECT id, store_id INTO v_employee_id, v_store_id
  FROM public.employees
  WHERE email = NEW.email
  LIMIT 1;

  IF v_employee_id IS NOT NULL THEN
    -- Link Auth ID to existing employee
    UPDATE public.employees
    SET user_id = NEW.id
    WHERE id = v_employee_id;
  ELSE
    -- New Business Owner: Create Store with owner_id
    INSERT INTO public.stores (name, owner_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'My ERP') || '''s Store',
      NEW.id -- <--- CRITICAL: Set the owner!
    )
    RETURNING id INTO v_store_id;

    -- Create Admin Employee linked to this store
    INSERT INTO public.employees (
      user_id,
      store_id,
      email,
      full_name,
      role,
      status
    ) VALUES (
      NEW.id,
      v_store_id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin User'),
      'admin',
      'active'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS on Stores (Robust Security)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can do everything with their own stores
DROP POLICY IF EXISTS "Owners can manage their stores" ON public.stores;
CREATE POLICY "Owners can manage their stores"
ON public.stores
FOR ALL
USING (auth.uid() = owner_id);

-- Policy: Employees can view their assigned store
DROP POLICY IF EXISTS "Employees can view their assigned store" ON public.stores;
CREATE POLICY "Employees can view their assigned store"
ON public.stores
FOR SELECT
USING (
  id IN (
    SELECT store_id FROM public.employees WHERE user_id = auth.uid()
  )
);
