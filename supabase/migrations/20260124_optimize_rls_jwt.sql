-- OPTIMIZATION: Store Isolation via JWT Metadata (Avoids RLS Recursion)

-- 1. Update Existing Users: Sync store_id from employees to auth.users metadata
-- This ensures 'get_my_store_id' works for everyone immediately.
DO $$
DECLARE
  emp RECORD;
BEGIN
  FOR emp IN SELECT user_id, store_id FROM public.employees WHERE user_id IS NOT NULL LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('store_id', emp.store_id)
    WHERE id = emp.user_id;
  END LOOP;
END $$;


-- 2. Update Trigger to Sync Metadata on Insert/Update
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_employee_id UUID;
  v_store_id UUID;
BEGIN
  -- 1. Check for existing invite
  SELECT id, store_id INTO v_employee_id, v_store_id
  FROM public.employees
  WHERE email = NEW.email
  LIMIT 1;

  IF v_employee_id IS NOT NULL THEN
    -- Link Auth ID
    UPDATE public.employees
    SET user_id = NEW.id
    WHERE id = v_employee_id;
    
    -- Sync valid store_id to metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('store_id', v_store_id)
    WHERE id = NEW.id;
    
  ELSE
    -- 2. New Admin User
    -- Create Store
    INSERT INTO public.stores (name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'My ERP') || '''s Store')
    RETURNING id INTO v_store_id;

    -- Create Employee
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
    
    -- Sync valid store_id to metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('store_id', v_store_id)
    WHERE id = NEW.id;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Update 'get_my_store_id' to read from JWT (No DB Query = No Recursion)
CREATE OR REPLACE FUNCTION public.get_my_store_id()
RETURNS UUID AS $$
DECLARE
  v_store_id text;
BEGIN
  -- Extract store_id from JWT app_metadata
  v_store_id := (auth.jwt() -> 'app_metadata' ->> 'store_id');
  
  -- Return as UUID (or NULL)
  IF v_store_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN v_store_id::UUID;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
